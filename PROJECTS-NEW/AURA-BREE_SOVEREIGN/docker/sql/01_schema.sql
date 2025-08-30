-- Sovereign AURA-BREE Database Schema
-- MethaClinic integration with audit logging and realtime features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL UNIQUE,
    phone_hash TEXT,
    alias TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    mood TEXT NOT NULL CHECK (mood IN ('excellent', 'good', 'neutral', 'low', 'critical')),
    notes_redacted TEXT,
    notes_raw_encrypted TEXT, -- For break-glass access
    flags TEXT[] DEFAULT '{}',
    source TEXT NOT NULL DEFAULT 'sovereign-aura-bree',
    client_hash TEXT NOT NULL,
    audit_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log table with hash chain
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    hash TEXT NOT NULL,
    prev_hash TEXT,
    signature TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinic staff table (for dashboard access)
CREATE TABLE IF NOT EXISTS clinic_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('reception', 'clinician', 'admin')),
    permissions JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard sessions table
CREATE TABLE IF NOT EXISTS dashboard_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES clinic_staff(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_device_id ON patients(device_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone_hash ON patients(phone_hash) WHERE phone_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON visits(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_visits_mood ON visits(mood);
CREATE INDEX IF NOT EXISTS idx_visits_flags ON visits USING GIN(flags);
CREATE INDEX IF NOT EXISTS idx_visits_source ON visits(source);

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor);
CREATE INDEX IF NOT EXISTS idx_audit_log_hash ON audit_log(hash);

CREATE INDEX IF NOT EXISTS idx_clinic_staff_email ON clinic_staff(email);
CREATE INDEX IF NOT EXISTS idx_clinic_staff_active ON clinic_staff(active) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_dashboard_sessions_token ON dashboard_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_dashboard_sessions_expires ON dashboard_sessions(expires_at);

-- Row Level Security (RLS) policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for patients table
CREATE POLICY "Clinic staff can view all patients" ON patients
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'role' IN ('reception', 'clinician', 'admin'));

CREATE POLICY "System can insert/update patients" ON patients
    FOR ALL TO service_role
    USING (true);

-- Policies for visits table
CREATE POLICY "Clinic staff can view visits" ON visits
    FOR SELECT TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('reception', 'clinician', 'admin')
        AND (
            auth.jwt() ->> 'role' = 'admin'
            OR auth.jwt() ->> 'role' = 'clinician'
            OR (auth.jwt() ->> 'role' = 'reception' AND created_at >= NOW() - INTERVAL '24 hours')
        )
    );

CREATE POLICY "System can insert visits" ON visits
    FOR INSERT TO service_role
    WITH CHECK (true);

-- Policies for audit log (read-only for most users)
CREATE POLICY "Admins can view audit log" ON audit_log
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can insert audit entries" ON audit_log
    FOR INSERT TO service_role
    WITH CHECK (true);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for patients updated_at
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for clinic_staff updated_at
CREATE TRIGGER update_clinic_staff_updated_at 
    BEFORE UPDATE ON clinic_staff 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to notify dashboard of new visits
CREATE OR REPLACE FUNCTION notify_dashboard_new_visit()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'clinic_dashboard',
        json_build_object(
            'event', 'visit_created',
            'visit_id', NEW.id,
            'patient_id', NEW.patient_id,
            'mood', NEW.mood,
            'timestamp', NEW.timestamp,
            'source', NEW.source,
            'flags', NEW.flags
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for visit notifications
CREATE TRIGGER notify_dashboard_visit_trigger
    AFTER INSERT ON visits
    FOR EACH ROW
    EXECUTE FUNCTION notify_dashboard_new_visit();

-- Function to validate hash chain integrity
CREATE OR REPLACE FUNCTION validate_audit_hash_chain()
RETURNS TRIGGER AS $$
DECLARE
    expected_prev_hash TEXT;
BEGIN
    -- Get the hash of the most recent audit entry
    SELECT hash INTO expected_prev_hash
    FROM audit_log
    WHERE timestamp < NEW.timestamp
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- Validate the previous hash matches
    IF expected_prev_hash IS NOT NULL AND NEW.prev_hash != expected_prev_hash THEN
        RAISE EXCEPTION 'Hash chain integrity violation: expected prev_hash %, got %', 
            expected_prev_hash, NEW.prev_hash;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for hash chain validation
CREATE TRIGGER validate_audit_hash_chain_trigger
    BEFORE INSERT ON audit_log
    FOR EACH ROW
    EXECUTE FUNCTION validate_audit_hash_chain();

-- Views for dashboard analytics
CREATE OR REPLACE VIEW clinic_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM patients) as total_patients,
    (SELECT COUNT(*) FROM visits) as total_visits,
    (SELECT COUNT(*) FROM visits WHERE DATE(timestamp) = CURRENT_DATE) as visits_today,
    (SELECT COUNT(*) FROM visits WHERE timestamp >= NOW() - INTERVAL '7 days') as visits_this_week,
    (SELECT COUNT(*) FROM visits WHERE 'low_mood' = ANY(flags) AND timestamp >= NOW() - INTERVAL '30 days') as flagged_visits_month,
    (SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(AVG(
                CASE mood
                    WHEN 'excellent' THEN 9
                    WHEN 'good' THEN 7
                    WHEN 'neutral' THEN 5
                    WHEN 'low' THEN 3
                    WHEN 'critical' THEN 1
                    ELSE 5
                END
            ), 1)
        END
     FROM visits 
     WHERE timestamp >= NOW() - INTERVAL '30 days'
    ) as average_mood_30_days;

-- View for recent visits with patient info
CREATE OR REPLACE VIEW recent_visits_with_patients AS
SELECT 
    v.id,
    v.timestamp,
    v.mood,
    v.flags,
    v.source,
    v.created_at,
    p.alias,
    p.device_id,
    CASE 
        WHEN 'crisis' = ANY(v.flags) OR 'emergency' = ANY(v.flags) THEN 'high'
        WHEN 'low_mood' = ANY(v.flags) OR v.mood IN ('low', 'critical') THEN 'medium'
        ELSE 'low'
    END as priority_level
FROM visits v
JOIN patients p ON v.patient_id = p.id
ORDER BY v.timestamp DESC;

-- Insert default admin user (for development)
INSERT INTO clinic_staff (email, name, role, permissions) 
VALUES (
    'admin@clinic.local', 
    'System Administrator', 
    'admin',
    '{"dashboard": true, "audit": true, "user_management": true}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON patients, visits TO authenticated;
GRANT SELECT ON clinic_dashboard_stats, recent_visits_with_patients TO authenticated;
GRANT ALL ON clinic_staff, dashboard_sessions TO authenticated;
