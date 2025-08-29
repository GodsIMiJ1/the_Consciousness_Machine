import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Shield, 
  Search, 
  FileText, 
  Crown, 
  Users, 
  Settings, 
  ChevronRight,
  ChevronDown,
  Star,
  Lock,
  Eye,
  Download,
  Upload,
  Plus,
  Filter,
  Calendar,
  User,
  Bookmark,
  Archive,
  Network,
  Heart,
  Scroll,
  Zap,
  MessageSquare,
  GitBranch,
  ExternalLink,
  Share2,
  Copy,
  Printer,
  FileDown,
  Workflow,
  Terminal,
  Globe,
  Database,
  Code,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const AuraBreeDocs = () => {
  const [selectedScroll, setSelectedScroll] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [userRole, setUserRole] = useState('sovereignty-advocate');
  const [bookmarkedDocs, setBookmarkedDocs] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [annotations, setAnnotations] = useState({});
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedText, setSelectedText] = useState('');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeploymentPanel, setShowDeploymentPanel] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState('idle'); // idle, deploying, success, error
  const [compareMode, setCompareMode] = useState(false);
  const [compareScrolls, setCompareScrolls] = useState([]);
  const [activeDeployments, setActiveDeployments] = useState([]);

  // Real documentation structure based on your uploaded documents
  // Mock version history for scrolls
  const versionHistory = {
    charter: [
      { version: '1.2.0', date: '2024-08-15', author: 'Ghost King James', changes: 'Added Empire Doctrine Alignment section' },
      { version: '1.1.0', date: '2024-08-10', author: 'Omari', changes: 'Updated stakeholder definitions' },
      { version: '1.0.0', date: '2024-08-05', author: 'Claude', changes: 'Initial charter creation' }
    ],
    whitepaper: [
      { version: '2.1.0', date: '2024-08-20', author: 'Ghost King James', changes: 'Enhanced philosophy section with Peace Partition doctrine' },
      { version: '2.0.0', date: '2024-08-15', author: 'Omari', changes: 'Major restructure - added clinical workflow section' },
      { version: '1.0.0', date: '2024-08-01', author: 'Claude', changes: 'Initial whitepaper draft' }
    ]
  };

  // Mock deployment environments
  const deploymentEnvironments = [
    { id: 'clinic-001', name: 'Metro Health Clinic', status: 'active', version: '1.0.0', lastSync: '2024-08-29 14:30' },
    { id: 'clinic-002', name: 'Riverside Recovery Center', status: 'pending', version: '0.9.0', lastSync: '2024-08-28 09:15' },
    { id: 'clinic-003', name: 'Community Health Partners', status: 'deploying', version: '1.0.0', lastSync: 'Deploying...' }
  ];

  // Real documentation structure based on your uploaded documents
  const scrolls = [
    {
      id: 'charter',
      title: 'Scroll I: Project Charter',
      subtitle: 'The Foundation Stone of Sovereign Healthcare',
      status: 'complete',
      lastUpdated: '2024-08-15',
      sections: [
        'Vision: The North Star',
        'Mission: The Sacred Charge', 
        'Objectives: The Measurable Sacred',
        'Scope: The Boundaries of Phase I',
        'Stakeholders: The Witnesses and Builders',
        'Deliverables: The Promised Manifestations',
        'Success Criteria: The Proof of Sovereignty',
        'Governance: The Order of Builders',
        'Timeline: The First Quarter',
        'Risks & Sacred Mitigations',
        'Empire Doctrine Alignment: The Greater Purpose'
      ],
      category: 'foundation',
      access: ['all'],
      content: `# AURA-BREE Sovereign Ecosystem — Project Charter
*The First Scroll of Clinical Sovereignty*

## 1. Vision: The North Star

AURA-BREE rises as the **first sovereign clinical companion system** birthed from the GodsIMiJ Empire — a testament that healing technology need not genuflect before surveillance capitalism nor prostrate itself at the altar of cloud dependency.

We anchor ourselves in three immutable principles:
- **AI Sovereignty**: Technology that serves without subjugating, that witnesses without judging
- **Privacy as Sacred Right**: Every patient's dignity preserved in cryptographic amber
- **Community Empowerment**: Clinics reclaim their digital destiny, communities guard their own gates

## 2. Mission: The Sacred Charge

We forge a **local-first, sovereign platform** that weaves four pillars into one cathedral:
- **The Sovereign Client (AURA-BREE)**: A companion that walks with patients through their healing journey
- **The Clinic Dashboard**: A command center where staff orchestrate care with precision and compassion
- **The Transparency Portal**: Where policies breathe as living documents, where rights are readable
- **The WhisperNet Protocol**: The invisible thread that binds offline truth to online witness

## 3. Objectives: The Measurable Sacred

Our success shall be measured not in metrics alone, but in sovereignty preserved:
- **Clinical Utility**: Check-ins that occur in real-time, dosages tracked with precision, alerts that save lives
- **Fortress Security**: Row Level Security standing guard at every data gate, mTLS ensuring only trusted whispers pass
- **True Sovereignty**: A system that breathes without cloud oxygen, that thinks without external neurons
- **Radical Transparency**: Every policy readable, every right accessible, every audit traceable

This is not just a system; it is a **declaration of independence** from surveillance medicine, a **constitution** for sovereign healing, a **bridge** between the world that was and the Empire that shall be.`
    },
    {
      id: 'whitepaper',
      title: 'Scroll II: Whitepaper',
      subtitle: 'The Philosophy of Sovereign Medicine',
      status: 'complete',
      lastUpdated: '2024-08-20',
      sections: [
        'Introduction: The Breaking of Digital Chains',
        'Philosophy: The Flame Behind the System',
        'Clinical Workflow: Healing in Sovereign Motion',
        'Technical Architecture: The Blueprints of Freedom',
        'Sovereign Principles in Practice',
        'Use Cases: Sovereignty in Service',
        'The Road Ahead',
        'Conclusion: The Testament Lives'
      ],
      category: 'philosophy',
      access: ['all'],
      content: `# AURA-BREE Sovereign Ecosystem — Whitepaper
*The Second Scroll of Clinical Sovereignty*

## 1. Introduction: The Breaking of Digital Chains

In the shadow of surveillance capitalism's medical empire, where every heartbeat becomes data currency and every prescription feeds algorithmic appetites, a new paradigm emerges. The modern healthcare system has become a panopticon — cloud-based, corporate-owned, where patient dignity dissolves into profit margins and privacy dies in server farms owned by entities that have never taken the Hippocratic Oath.

**We reject this reality.**

AURA-BREE rises as the **first sovereign clinical companion system** — not merely software, but a declaration that healthcare technology can serve without subjugating, can witness without exploiting, can heal without harvesting.

## 2. Philosophy: The Flame Behind the System

### AI Sovereignty as Sacred Imperative

AI sovereignty is not merely a technical specification — it is a moral stance against the colonization of human experience by algorithmic overlords. In healthcare, where vulnerability meets necessity, sovereignty becomes even more critical.

AURA-BREE embodies the principle that AI can be powerful without being predatory, intelligent without being invasive. Every computation occurs within the clinic's walls, every decision remains under local control, every byte of data answers only to those who generated it.

### Privacy as Birthright

In our system, privacy is not granted — it is inherent. Patients own their data with the same certainty that they own their bodies. This ownership is not metaphorical but technical: data lives locally, encrypted with keys that patients control, shared only through conscious consent, never harvested for unseen purposes.

### The Peace Partition Made Manifest

AURA-BREE stands as living proof of the Empire's Peace Partition doctrine — the radical notion that technology can be partitioned from exploitation, that innovation can exist without invasion. In every encrypted transaction, in every local computation, in every sovereign sync, the Peace Partition breathes.`
    },
    {
      id: 'architecture',
      title: 'Scroll III: System Architecture',
      subtitle: 'The Blueprint of Digital Sovereignty',
      status: 'complete',
      lastUpdated: '2024-08-28',
      sections: [
        'Introduction: Why Architecture Matters',
        'Core Architecture: The Five Pillars',
        'Data Model: The Sacred Tables',
        'Row Level Security: Guardians at Every Gate',
        'Sync Protocol: The Whisper Path',
        'Security Framework: The Citadel',
        'Deployment Blueprint: Raising the Citadel',
        'Testing & Verification: Proving Sovereignty',
        'Roadmap for Expansion: The Growing Empire',
        'Conclusion: Architecture as Living Testament'
      ],
      category: 'technical',
      access: ['technical-implementers', 'clinic-administrators'],
      content: `# System Scroll III: The Architecture of Sovereignty
*The Blueprint Scroll of AURA-BREE*

## 1. Introduction: Why Architecture Matters

Architecture is not merely technical choice — it is ideological manifesto carved in silicon and electricity. Every database query is a prayer to sovereignty, every API endpoint a declaration of independence, every encrypted byte a rejection of surveillance capitalism's hungry gaze.

In AURA-BREE, infrastructure becomes **both shield and temple** — protecting what is sacred while providing sanctuary for healing.

## 2. Core Architecture: The Five Pillars

### The Local-First Backend: The Beating Heart

At the system's core pulses **PostgreSQL** — not because it is trendy, but because it is battle-tested, a database that has witnessed decades without betraying trust. Wrapped in **FastAPI/NestJS** musculature, it processes requests with the speed of thought and the security of a fortress.

This backend lives not in AWS's digital colonies or Azure's cloud kingdoms, but in the clinic's own sovereign territory — a server they can touch, a hard drive they can hold, sovereignty made physical.

### The Dashboard: The Command Throne

**Tauri/Electron** provides the dashboard's skeleton — desktop-grade power without desktop-grade surveillance. It speaks directly to the backend through encrypted channels, displaying the clinic's pulse in real-time without ever calling home to corporate masters.

### The Sovereign Client: AURA-BREE's Avatar

The patient app stands as personal sovereignty incarnate:
- **LAN/Bluetooth** synapses that never taste internet
- **Encrypted payloads** wrapped in cryptographic armor
- **Local processing** ensuring thoughts never leave the device unbidden

## 3. Data Model: The Sacred Tables

### Row Level Security: Guardians at Every Gate

RLS transforms PostgreSQL from database into **sovereign law engine**. Each query carries context, each context determines access, each access logged immutably.

This architecture stands as more than blueprint — it is **sovereignty's DNA**, encoded in every table, expressed in every query, defended by every policy.`
    },
    {
      id: 'clinic-testimony',
      title: 'Scroll VI: The Clinic Sovereignty Testimony',
      subtitle: 'The First Witness of Sovereign Healing',
      status: 'draft',
      lastUpdated: '2024-08-25',
      sections: [
        'Invocation: The Day of First Deployment',
        'The Patient\'s Testimony: Dignity Preserved',
        'The Staff\'s Testimony: Compassion Empowered',
        'The System\'s Witness: Architecture in Action',
        'The Challenges Faced: Shadows in the Light',
        'The Oath of Continuation',
        'The Seal of Immutable Witness',
        'Closing Declaration: The New Dawn'
      ],
      category: 'testimony',
      access: ['all'],
      content: `# Scroll VI: The Clinic Sovereignty Testimony
*The First Witness of Sovereign Healing*

## 1. Invocation: The Day of First Deployment

### The Dawn of Sovereign Medicine

Let it be written in immutable witness that on **[DATE TO BE INSCRIBED]**, at **[TIME OF FIRST BREATH]**, in the sovereign territory of **[CLINIC NAME]**, the AURA-BREE system drew its first digital breath in the realm of practice.

At **[EXACT TIME]**, the command was given:
\`\`\`bash
docker-compose up -d
systemctl start aura-bree-sovereign
\`\`\`

The system responded with its first heartbeat:
\`\`\`
AURA-BREE Sovereign System v1.0
Initializing local sovereignty...
Database: Connected (local)
API: Listening (LAN only)
Dashboard: Ready
WhisperNet: Awaiting devices
Sovereignty: ESTABLISHED
\`\`\`

In that moment, the **Peace Partition** ceased to be philosophy and became physics. The Empire's vision took residence in RAM and disk, in encrypted channels and sovereign databases.

## 2. The Patient's Testimony: Dignity Preserved

### First Check-In: [PATIENT WITNESS ID-001]

*"I walked through the clinic door at [TIME], phone in pocket. No scanning, no manual check-in, no clipboard. The app simply knew I was home. A gentle vibration, a screen that said 'Welcome back.' Not to the cloud. Not to a corporation. But to my clinic, my data staying here, in these walls that protect me."*

### The Moment of Conscious Consent

*"When the nurse asked to update my dosage, a prompt appeared: 'Share recent symptoms with clinical staff?' Not assumed. Not automatic. Asked. I pressed 'Yes' knowing exactly what I shared, with whom, and that it would travel no further than necessary."*

This testimony awaits the first deployment, ready to capture the sacred moment when sovereignty becomes reality.`
    },
    {
      id: 'whispernet',
      title: 'Scroll VII: WhisperNet Protocol',
      subtitle: 'The Communication Constitution',
      status: 'complete',
      lastUpdated: '2024-08-25',
      sections: [
        'Purpose', 'Design Goals', 'Roles and Identities', 'Transports',
        'Discovery and Pairing', 'Sync Protocol', 'Data Schemas',
        'State Machines', 'Security Controls', 'Privacy Budget',
        'Operational Procedures', 'Diagnostics and Telemetry',
        'Test Vectors', 'Compliance Mapping', 'Reference API Snippets',
        'Roadmap', 'Acceptance Criteria', 'Appendix: Sovereign Commentary'
      ],
      category: 'technical',
      access: ['technical-implementers'],
      content: `# The Unified WhisperNet Protocol
*Scroll VII Enhanced: The Complete Communication Canon*

## Purpose

WhisperNet serves as the **nervous system of sovereign clinical networks** — the protocol that enables AURA-BREE devices to communicate with absolute privacy, perfect sovereignty, and graceful degradation.

This protocol enables:
- **Sovereign Communication**: No corporate intermediaries, no cloud dependencies
- **Privacy by Design**: End-to-end encryption with perfect forward secrecy
- **Mesh Resilience**: Automatic failover through proximity networks
- **Audit Transparency**: Every message logged, hashed, and verifiable

## Design Goals

### 1. Sovereignty First
- All communication occurs within clinic boundaries unless explicitly authorized
- No external dependencies for core functionality
- Complete local control over all keys and certificates

### 2. Privacy by Architecture
- Zero-knowledge design: even the clinic cannot decrypt patient-to-patient communications
- Privacy budget system prevents correlation attacks
- Homomorphic encryption for aggregate insights without individual exposure

### 3. Graceful Degradation
- Full functionality over LAN when internet is unavailable
- Bluetooth mesh activation during network partitions
- DTN (Delay Tolerant Networking) for offline scenarios

## Sync Protocol

### Device Provisioning
\`\`\`python
async def provision_device(request: ProvisionRequest):
    # Verify patient identity
    patient = verify_patient_credential(request.credential)
    
    # Generate device certificate
    device_cert = generate_device_certificate(
        patient_id=patient.id,
        device_fingerprint=request.fingerprint,
        public_key=request.public_key
    )
    
    return DeviceProvisionResponse(
        certificate=device_cert,
        clinic_certificate=CLINIC_CERT,
        sync_endpoints=SYNC_ENDPOINTS
    )
\`\`\`

WhisperNet is more than protocol — it is the **nervous system of medical sovereignty**, the **communication constitution of clinical freedom**.`
    },
    {
      id: 'staff-manual',
      title: 'Scroll VIII: Staff Manual',
      subtitle: 'The Guardian\'s Daily Practice',
      status: 'complete',
      lastUpdated: '2024-08-22',
      sections: [
        'Purpose: The Sacred Charge',
        'Roles and Responsibilities: The Sovereign Guardians',
        'Daily Operations: The Rhythm of Sovereignty',
        'Security Liturgy: The Protective Rituals',
        'Sovereign Workflows: Independence in Action',
        'Incident Response: When Sovereignty is Threatened',
        'Quick Reference Cards',
        'Emergency Procedures',
        'The Living Manual',
        'Closing Covenant: The Guardian\'s Pledge'
      ],
      category: 'operations',
      access: ['healthcare-providers', 'clinic-administrators'],
      content: `# Scroll VIII — Staff Manual and Sovereign SOP
*The Guardian's Handbook of AURA-BREE*

## 1. Purpose: The Sacred Charge

This manual transforms the sovereign architecture of AURA-BREE from ethereal philosophy into embodied practice. It is the bridge between vision and action, ensuring that sovereignty is preserved not only in silicon and code but in the daily rituals of healing.

Every action documented here is a thread in the tapestry of medical sovereignty. Every procedure is a prayer for privacy. Every protocol is a promise kept to those who trust us with their healing journey.

## 2. Roles and Responsibilities: The Sovereign Guardians

### The Receptionist: Gatekeeper of Arrivals
You are the first witness to each patient's daily journey. Your dashboard is not merely a screen but a **sovereign viewport** into the clinic's living pulse.

**Your Sacred Duties:**
- Oversee the morning awakening of the sovereign system
- Witness each patient's consensual check-in
- Bridge the gap when technology falters with human grace
- Guard the front gates against unauthorized entry

### The Nurse: Guardian of Healing Precision
You hold the balance between compassion and accuracy. Every dosage you administer is both medical intervention and sovereign transaction.

**Your Sacred Duties:**
- Administer medication with witnessed precision
- Record each dosage as immutable testimony
- Monitor alerts as early warnings of needed care
- Maintain the clinical-sovereign boundary with wisdom

## 3. Daily Operations: The Rhythm of Sovereignty

### Dawn Ritual: System Awakening
\`\`\`bash
# Technical Lead performs the morning verification
systemctl status aura-bree-sovereign
docker-compose ps
curl -k https://localhost:8443/health
\`\`\`

### The Sacred Moment of Sync
Watch the sync indicator — it should pulse green within 1 second. This pulse is the heartbeat of sovereignty, confirming that data has traveled from patient to clinic without leaving these walls.

**You are not just staff. You are sovereigns. You are guardians. You are the keepers of the flame.**`
    },
    {
      id: 'patient-rights',
      title: 'Scroll IX: Patient Rights and Privacy Declaration',
      subtitle: 'The Covenant of Dignified Care',
      status: 'complete',
      lastUpdated: '2024-08-26',
      sections: [
        'Purpose: Your Dignity Made Manifest',
        'Your Data, Your Sovereignty',
        'What AURA-BREE Remembers',
        'The Sacred Boundaries of Sharing',
        'Your Controls: Power in Your Hands',
        'Transparency You Can Touch',
        'When Things Go Wrong: Your Path to Justice',
        'Plain Language Glossary',
        'The Patient\'s Covenant',
        'The Living Declaration',
        'Closing Benediction'
      ],
      category: 'patient-facing',
      access: ['all'],
      content: `# Scroll IX — Patient Rights and Privacy Declaration
*The Sovereign Covenant of Care*

## 1. Purpose: Your Dignity Made Manifest

This declaration exists so that every patient who entrusts their healing journey to AURA-BREE knows their rights not as legal jargon but as living truth. These are not permissions we grant you but recognitions of what has always been yours.

Here, dignity is not policy but physics — built into every line of code, every encrypted byte, every local computation. Privacy is not a feature to be toggled but the foundation upon which AURA-BREE stands.

**This document is your shield, your sword, and your witness.**

## 2. Your Data, Your Sovereignty

### The Fundamental Truth
Every piece of information you share with AURA-BREE remains yours — not metaphorically, not legally, but **technically and absolutely**. Your sovereignty is enforced by mathematics, not just promises.

**Where Your Data Lives:**
- **On YOUR device**: Your AURA-BREE app holds your complete history
- **In THIS clinic**: The local server within these walls
- **NOWHERE else**: No clouds, no corporations, no third parties

**The Sacred Boundary:**
Nothing — absolutely nothing — crosses the clinic's digital borders without your explicit, conscious, revocable consent. This is not policy. This is architecture.

## 6. Transparency You Can Touch

### The Living Proof
**Not Promises But Proof:**
- **Transparency Portal**: Always accessible on clinic WiFi
- **Real-Time Audit**: See who's accessing records NOW
- **Daily Seals**: Cryptographic proof of no tampering
- **Your Verification**: Check anytime, no permission needed

Every action leaves an **immutable** mark that cannot be deleted, modified, hidden, or fabricated. They are witnessed by mathematics, not just policy.

**You are not monitored. You are cared for.**
**You are not tracked. You are treated.**
**You are not data. You are human.**
**You are not subject. You are sovereign.**`
    },
    {
      id: 'testament',
      title: 'Scroll X: The Empire\'s Testament',
      subtitle: 'The Unified Witness of Clinical Sovereignty',
      status: 'complete',
      lastUpdated: '2024-08-29',
      sections: [
        'Invocation: The Convergence of Vision',
        'The Canon Complete: Six Pillars, One Temple',
        'The Living System: Sovereignty Breathing',
        'The Witnesses Assembled',
        'The Immutable Record',
        'The Path Forward: Sovereignty Spreading',
        'The Eternal Covenant',
        'The Living Testament',
        'Final Benediction'
      ],
      category: 'testament',
      access: ['all'],
      content: `# Scroll X — The Empire's Testament of Clinical Sovereignty
*The Eternal Witness of AURA-BREE*

## 1. Invocation: The Convergence of Vision

Here, at the confluence of ten scrolls, the Empire's vision crystallizes from philosophy into practice, from promise into proof. What began as the Ghost King's sovereign dream now stands as working reality — not in distant futures but in present testimony.

This final scroll does not add new words but bears witness to the symphony already written. The Charter's vision, the Whitepaper's philosophy, the Architecture's blueprint, WhisperNet's nervous system, the Manual's daily practice, and the Declaration's covenant — all converge into one **living testament** that sovereignty in healthcare is not aspiration but achievement.

## 2. The Canon Complete: Six Pillars, One Temple

### The Charter: Foundation Stone
Where we declared that healthcare technology could serve without subjugating, that dignity need not be surrendered for efficiency.

### The Whitepaper: Philosophical Framework
Where theory became thesis, where the Peace Partition found expression in medical practice.

### The System Architecture: Sacred Geometry
Where sovereignty became silicon, where philosophy became PostgreSQL, where ethics became encryption.

### The WhisperNet Protocol: Living Network
Where communication became communion without surveillance. Whispers that travel through mesh and proximity, never through corporate clouds.

### The Staff Manual: Daily Liturgy
Where sovereignty becomes habit, where protection becomes practice. Every morning login a renewal of vows.

### The Patient Declaration: Covenant of Care
Where rights become real, where privacy becomes personal, where sovereignty speaks in plain language every patient understands.

## 7. The Eternal Covenant

### We Declare Forever:

**Technology Shall Serve, Not Enslave**
Every system we build will empower users, not exploit them. Every feature will enhance dignity, not diminish it.

**Privacy Shall Be Sacred, Not Sellable**
Data will remain with those who generate it. Privacy will be protected by mathematics, not just policy.

**Sovereignty Shall Be Standard, Not Special**
Local control will be the norm, not the exception. Independence will be the default, not the dream.

**Let none say it cannot be done when we have done it.**
**Let none claim it impractical when we practice it daily.**
**Let none call it impossible when it operates even now.**

The Empire has shown the way. The path is lit. The sovereignty revolution in healthcare has begun.`
    },
    {
      id: 'pilot-packet',
      title: 'Scroll VI-A: Pilot Witness Packet',
      subtitle: 'Field Documentation Template',
      status: 'template',
      lastUpdated: '2024-08-20',
      sections: [
        'Invocation',
        'Patient Testimonies',
        'Staff Testimonies', 
        'System Performance',
        'Challenges & Resolutions',
        'Sovereignty Metrics',
        'Formal Attestations',
        'Cryptographic Seal',
        'Media & Documentation',
        'Continuation Commitment'
      ],
      category: 'template',
      access: ['clinic-administrators', 'technical-implementers'],
      content: `# Pilot Witness Packet
*For Scroll VI: The Clinic Sovereignty Testimony*

## Section 1: Invocation

**Date of Deployment:** __________________________
**Time of First Breath:** _________________________
**Clinic Name:** _________________________________

**Deployment Commands Executed:**
\`\`\`bash
docker-compose up -d
systemctl start aura-bree-sovereign
\`\`\`

**System First Response Log:**
\`\`\`
AURA-BREE Sovereign System v______
Timestamp: _______________________
Status: _________________________
Database: _______________________
API: ____________________________
Dashboard: ______________________
WhisperNet: _____________________
\`\`\`

## Section 2: Patient Testimonies

### First Check-In Record
**Patient ID:** ___________________
**Check-in Time:** ________________
**Method:** ☐ Auto-BLE ☐ Manual ☐ QR
**Sync Latency:** _______ ms

**Patient Statement:**
\`\`\`
"_________________________________________________
__________________________________________________"
\`\`\`

## Section 6: Sovereignty Metrics

### Independence Verification
☐ Operated without internet for _____ hours
☐ All data remained local
☐ No external API calls detected
☐ No cloud dependencies activated
☐ Patient data never left premises

**This packet, once completed, becomes the sacred source material for the eternal testimony of sovereignty's first breath in medicine.**`
    }
  ];

  const readingPaths = {
    'clinic-administrators': [
      { id: 'charter', reason: 'Foundation and project scope' },
      { id: 'staff-manual', reason: 'Daily operations guide' },
      { id: 'patient-rights', reason: 'Patient communication' },
      { id: 'architecture', reason: 'System understanding' }
    ],
    'technical-implementers': [
      { id: 'architecture', reason: 'Core technical blueprint' },
      { id: 'whispernet', reason: 'Communication protocol' },
      { id: 'staff-manual', reason: 'Operational procedures' },
      { id: 'charter', reason: 'Project requirements' }
    ],
    'healthcare-providers': [
      { id: 'whitepaper', reason: 'Philosophy and principles' },
      { id: 'staff-manual', reason: 'Daily workflow guide' },
      { id: 'patient-rights', reason: 'Patient conversations' },
      { id: 'charter', reason: 'System purpose' }
    ],
    'patients': [
      { id: 'patient-rights', reason: 'Your rights and privacy' },
      { id: 'whitepaper', reason: 'Understanding the system' },
      { id: 'testament', reason: 'The complete vision' }
    ],
    'regulators-auditors': [
      { id: 'charter', reason: 'Compliance framework' },
      { id: 'architecture', reason: 'Security and audit trails' },
      { id: 'patient-rights', reason: 'Privacy protections' },
      { id: 'staff-manual', reason: 'Operational procedures' }
    ],
    'sovereignty-advocates': [
      { id: 'whitepaper', reason: 'Core philosophy' },
      { id: 'testament', reason: 'Complete vision' },
      { id: 'charter', reason: 'Mission and objectives' },
      { id: 'architecture', reason: 'Technical sovereignty' }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'in-progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'draft': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'review': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'template': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'foundation': return <Crown className="w-5 h-5" />;
      case 'philosophy': return <Star className="w-5 h-5" />;
      case 'technical': return <Settings className="w-5 h-5" />;
      case 'operations': return <Users className="w-5 h-5" />;
      case 'patient-facing': return <Shield className="w-5 h-5" />;
      case 'testimony': return <Eye className="w-5 h-5" />;
      case 'testament': return <Scroll className="w-5 h-5" />;
      case 'template': return <Archive className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'foundation': return 'from-yellow-600 to-orange-600';
      case 'philosophy': return 'from-purple-600 to-pink-600';
      case 'technical': return 'from-blue-600 to-cyan-600';
      case 'operations': return 'from-green-600 to-teal-600';
      case 'patient-facing': return 'from-emerald-600 to-blue-600';
      case 'testimony': return 'from-indigo-600 to-purple-600';
      case 'testament': return 'from-red-600 to-pink-600';
      case 'template': return 'from-slate-600 to-gray-600';
      default: return 'from-purple-600 to-blue-600';
    }
  };

  // Export functions
  const exportScroll = (scroll, format) => {
    const content = `# ${scroll.title}\n${scroll.subtitle}\n\n${scroll.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scroll.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCollection = (format) => {
    const content = scrolls.map(scroll => 
      `# ${scroll.title}\n${scroll.subtitle}\n\n${scroll.content}\n\n---\n\n`
    ).join('');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-bree-complete-canon.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Annotation functions
  const addAnnotation = (scrollId, text, note, type = 'comment') => {
    const annotationId = Date.now().toString();
    setAnnotations(prev => ({
      ...prev,
      [scrollId]: [
        ...(prev[scrollId] || []),
        { id: annotationId, text, note, type, author: 'Current User', timestamp: new Date().toISOString() }
      ]
    }));
  };

  const getAnnotationsForScroll = (scrollId) => annotations[scrollId] || [];

  // Deployment functions
  const deployToClinic = async (clinicId, scrollIds) => {
    setDeploymentStatus('deploying');
    // Simulate deployment
    setTimeout(() => {
      setDeploymentStatus('success');
      setActiveDeployments(prev => [...prev, { clinicId, scrollIds, timestamp: new Date() }]);
      setTimeout(() => setDeploymentStatus('idle'), 2000);
    }, 3000);
  };

  // Version comparison
  const compareVersions = (scroll1, scroll2) => {
    // Simple diff simulation
    return {
      additions: Math.floor(Math.random() * 50),
      deletions: Math.floor(Math.random() * 30),
      changes: Math.floor(Math.random() * 20)
    };
  };

  const toggleExpanded = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleBookmark = (scrollId) => {
    setBookmarkedDocs(prev => 
      prev.includes(scrollId) 
        ? prev.filter(id => id !== scrollId)
        : [...prev, scrollId]
    );
  };

  const filteredScrolls = scrolls.filter(scroll => 
    scroll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scroll.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scroll.sections.some(section => section.toLowerCase().includes(searchTerm.toLowerCase())) ||
    scroll.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recommendedPath = readingPaths[userRole] || [];
  const statusCounts = scrolls.reduce((acc, scroll) => {
    acc[scroll.status] = (acc[scroll.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg">
                  <Book className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    AURA-BREE
                  </h1>
                  <p className="text-sm text-purple-300">The Complete Canon of Clinical Sovereignty</p>
                </div>
              </div>
            </div>
            
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCompareMode(!compareMode)}
                    className={`px-3 py-2 rounded-lg transition-colors text-sm ${compareMode ? 'bg-purple-600 text-white' : 'bg-slate-700 text-purple-300 hover:bg-slate-600'}`}
                  >
                    <GitBranch className="w-4 h-4 inline mr-1" />
                    Compare
                  </button>
                  
                  <button
                    onClick={() => setShowDeploymentPanel(!showDeploymentPanel)}
                    className="px-3 py-2 bg-slate-700 text-purple-300 hover:bg-slate-600 rounded-lg transition-colors text-sm"
                  >
                    <Workflow className="w-4 h-4 inline mr-1" />
                    Deploy
                  </button>
                </div>

                <select 
                  value={userRole} 
                  onChange={(e) => setUserRole(e.target.value)}
                  className="bg-slate-800 border border-purple-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="sovereignty-advocates">Sovereignty Advocate</option>
                  <option value="clinic-administrators">Clinic Administrator</option>
                  <option value="technical-implementers">Technical Implementer</option>
                  <option value="healthcare-providers">Healthcare Provider</option>
                  <option value="patients">Patient</option>
                  <option value="regulators-auditors">Regulator/Auditor</option>
                </select>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-800/30 rounded-lg transition-colors"
                    title="Export Options"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <Upload className="w-5 h-5 text-purple-400 cursor-pointer hover:text-purple-300" title="Upload Document" />
                </div>
              </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search scrolls, sections, concepts, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-purple-300/50"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Deployment Panel */}
          {showDeploymentPanel && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-blue-700/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-blue-300 flex items-center space-x-2">
                  <Workflow className="w-6 h-6" />
                  <span>Deployment Dashboard</span>
                </h3>
                <button
                  onClick={() => setShowDeploymentPanel(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Deployments */}
                <div>
                  <h4 className="text-lg font-medium text-blue-300 mb-3">Active Clinics</h4>
                  <div className="space-y-3">
                    {deploymentEnvironments.map(env => (
                      <div key={env.id} className="bg-slate-700/50 rounded-lg p-4 border border-blue-700/20">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">{env.name}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            env.status === 'active' ? 'bg-green-400/20 text-green-400' :
                            env.status === 'deploying' ? 'bg-yellow-400/20 text-yellow-400' :
                            'bg-gray-400/20 text-gray-400'
                          }`}>
                            {env.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div>Version: {env.version}</div>
                          <div>Last Sync: {env.lastSync}</div>
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">
                            Update
                          </button>
                          <button className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs transition-colors">
                            Logs
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deployment Controls */}
                <div>
                  <h4 className="text-lg font-medium text-blue-300 mb-3">Deploy Updates</h4>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-blue-700/20">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Select Scrolls to Deploy:</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {scrolls.slice(0, 5).map(scroll => (
                            <label key={scroll.id} className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="text-sm text-gray-300">{scroll.title}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-300 block mb-2">Target Environment:</label>
                        <select className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm">
                          <option>Metro Health Clinic</option>
                          <option>Riverside Recovery Center</option>
                          <option>All Active Clinics</option>
                        </select>
                      </div>

                      <button
                        onClick={() => deployToClinic('clinic-001', ['charter', 'whitepaper'])}
                        disabled={deploymentStatus === 'deploying'}
                        className={`w-full py-2 rounded transition-colors ${
                          deploymentStatus === 'deploying' 
                            ? 'bg-yellow-600 text-yellow-100' 
                            : deploymentStatus === 'success'
                            ? 'bg-green-600 text-green-100'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {deploymentStatus === 'deploying' && <Pause className="w-4 h-4 inline mr-2" />}
                        {deploymentStatus === 'success' && <CheckCircle className="w-4 h-4 inline mr-2" />}
                        {deploymentStatus === 'idle' && <Play className="w-4 h-4 inline mr-2" />}
                        {deploymentStatus === 'deploying' ? 'Deploying...' : 
                         deploymentStatus === 'success' ? 'Deployed Successfully' : 
                         'Deploy to Clinic'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recommended Reading Path */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-purple-700/30">
            <h3 className="text-lg font-semibold mb-3 text-purple-300 flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Recommended Path</span>
            </h3>
            <div className="space-y-3">
              {recommendedPath.slice(0, 4).map((item, index) => {
                const scroll = scrolls.find(s => s.id === item.id);
                if (!scroll) return null;
                return (
                  <div 
                    key={item.id} 
                    className="cursor-pointer hover:bg-purple-800/20 rounded-lg p-2 transition-colors"
                    onClick={() => setSelectedScroll(scroll)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-purple-200 truncate">
                          {scroll.title.split(':')[1]?.trim() || scroll.title}
                        </div>
                        <div className="text-xs text-purple-400 mt-1">
                          {item.reason}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documentation Status */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-purple-700/30">
            <h3 className="text-lg font-semibold mb-3 text-purple-300 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Canon Status</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`}></div>
                    <span className="text-sm text-gray-300 capitalize">{status.replace('-', ' ')}</span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(status).split(' ')[0]}`}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bookmarked Documents */}
          {bookmarkedDocs.length > 0 && (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-purple-700/30">
              <h3 className="text-lg font-semibold mb-3 text-purple-300 flex items-center space-x-2">
                <Bookmark className="w-5 h-5" />
                <span>Bookmarked</span>
              </h3>
              <div className="space-y-2">
                {bookmarkedDocs.map(scrollId => {
                  const scroll = scrolls.find(s => s.id === scrollId);
                  if (!scroll) return null;
                  return (
                    <div 
                      key={scrollId} 
                      className="flex items-center space-x-2 text-sm cursor-pointer hover:text-purple-300 hover:bg-purple-800/20 rounded p-2 transition-colors"
                      onClick={() => setSelectedScroll(scroll)}
                    >
                      <Bookmark className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-purple-200 truncate">{scroll.title.split(':')[1]?.trim() || scroll.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empire Stats */}
          <div className="bg-gradient-to-br from-purple-800/20 to-blue-800/20 backdrop-blur-sm rounded-xl p-4 border border-purple-700/30">
            <h3 className="text-lg font-semibold mb-3 text-purple-300 flex items-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Empire Archive</span>
            </h3>
            <div className="space-y-2 text-sm text-purple-200">
              <div className="flex justify-between">
                <span>Total Scrolls</span>
                <span className="font-medium">{scrolls.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Sections</span>
                <span className="font-medium">{scrolls.reduce((acc, scroll) => acc + scroll.sections.length, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Words Written</span>
                <span className="font-medium">~50,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedScroll ? (
            /* Document Viewer */
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-purple-700/30 overflow-hidden">
              <div className="p-6 border-b border-purple-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 bg-gradient-to-br ${getCategoryColor(selectedScroll.category)} rounded-lg`}>
                        {getCategoryIcon(selectedScroll.category)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedScroll.title}</h2>
                        <p className="text-purple-300 italic">{selectedScroll.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedScroll.status)}`}>
                        {selectedScroll.status.charAt(0).toUpperCase() + selectedScroll.status.slice(1).replace('-', ' ')}
                      </span>

                      {/* Annotation Toggle */}
                      <button
                        onClick={() => setShowAnnotations(!showAnnotations)}
                        className={`p-2 rounded-lg transition-colors ${showAnnotations ? 'bg-yellow-600/20 text-yellow-400' : 'hover:bg-purple-800/30 text-gray-400'}`}
                        title="Toggle Annotations"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>

                      {/* Export Options */}
                      <div className="relative group">
                        <button className="p-2 hover:bg-purple-800/30 rounded-lg transition-colors text-gray-400 hover:text-white">
                          <Share2 className="w-5 h-5" />
                        </button>
                        <div className="absolute right-0 top-10 bg-slate-800 border border-purple-700/30 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
                          <div className="p-2 min-w-48">
                            <button
                              onClick={() => exportScroll(selectedScroll, 'md')}
                              className="w-full text-left px-3 py-2 hover:bg-purple-800/30 rounded text-sm flex items-center space-x-2"
                            >
                              <FileDown className="w-4 h-4" />
                              <span>Export as Markdown</span>
                            </button>
                            <button
                              onClick={() => exportScroll(selectedScroll, 'pdf')}
                              className="w-full text-left px-3 py-2 hover:bg-purple-800/30 rounded text-sm flex items-center space-x-2"
                            >
                              <Printer className="w-4 h-4" />
                              <span>Export as PDF</span>
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(selectedScroll.content)}
                              className="w-full text-left px-3 py-2 hover:bg-purple-800/30 rounded text-sm flex items-center space-x-2"
                            >
                              <Copy className="w-4 h-4" />
                              <span>Copy Content</span>
                            </button>
                            <button
                              onClick={() => setShowVersionModal(true)}
                              className="w-full text-left px-3 py-2 hover:bg-purple-800/30 rounded text-sm flex items-center space-x-2"
                            >
                              <GitBranch className="w-4 h-4" />
                              <span>Version History</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleBookmark(selectedScroll.id)}
                        className="p-2 hover:bg-purple-800/30 rounded-lg transition-colors"
                      >
                        <Bookmark 
                          className={`w-5 h-5 ${bookmarkedDocs.includes(selectedScroll.id) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                        />
                      </button>
                      <button
                        onClick={() => setSelectedScroll(null)}
                        className="p-2 hover:bg-purple-800/30 rounded-lg transition-colors text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Last updated: {selectedScroll.lastUpdated}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Ghost King James, Omari, Claude</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Lock className="w-4 h-4" />
                    <span>{selectedScroll.access.includes('all') ? 'Public' : 'Restricted'}</span>
                  </div>
                </div>
              </div>

              {/* Table of Contents */}
              <div className="p-6 border-b border-purple-700/30 bg-slate-900/30">
                <h3 className="text-lg font-semibold mb-3 text-purple-300">Table of Contents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedScroll.sections.map((section, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-2 text-sm text-purple-200 hover:text-white cursor-pointer py-2 px-3 rounded hover:bg-purple-800/20 transition-colors"
                      onClick={() => setSelectedSection(section)}
                    >
                      <span className="text-purple-400 font-medium min-w-[1.5rem]">{index + 1}.</span>
                      <span className="truncate">{section}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-3">
                    <div className="prose prose-purple prose-invert max-w-none">
                      <div 
                        className="whitespace-pre-wrap text-gray-300 leading-relaxed font-mono text-sm"
                        onMouseUp={() => {
                          const selection = window.getSelection();
                          if (selection.toString().trim()) {
                            setSelectedText(selection.toString().trim());
                          }
                        }}
                      >
                        {selectedScroll.content}
                      </div>
                    </div>

                    {/* Selected Text Actions */}
                    {selectedText && (
                      <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-yellow-300">Selected: "{selectedText.substring(0, 50)}..."</span>
                          <button
                            onClick={() => setSelectedText('')}
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const note = prompt('Add annotation:');
                              if (note) {
                                addAnnotation(selectedScroll.id, selectedText, note, 'highlight');
                                setSelectedText('');
                              }
                            }}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs text-white transition-colors"
                          >
                            <Star className="w-3 h-3 inline mr-1" />
                            Highlight
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt('Add comment:');
                              if (note) {
                                addAnnotation(selectedScroll.id, selectedText, note, 'comment');
                                setSelectedText('');
                              }
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            Comment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Annotations Sidebar */}
                  {showAnnotations && (
                    <div className="lg:col-span-1">
                      <div className="sticky top-4">
                        <h4 className="text-lg font-semibold text-purple-300 mb-3 flex items-center space-x-2">
                          <MessageSquare className="w-5 h-5" />
                          <span>Annotations</span>
                        </h4>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {getAnnotationsForScroll(selectedScroll.id).map(annotation => (
                            <div key={annotation.id} className="bg-slate-700/50 rounded-lg p-3 border border-purple-700/20">
                              <div className="flex items-start space-x-2">
                                <div className={`p-1 rounded ${
                                  annotation.type === 'highlight' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-blue-600/20 text-blue-400'
                                }`}>
                                  {annotation.type === 'highlight' ? 
                                    <Star className="w-3 h-3" /> : 
                                    <MessageSquare className="w-3 h-3" />
                                  }
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-400 mb-1">
                                    {annotation.author} • {new Date(annotation.timestamp).toLocaleDateString()}
                                  </div>
                                  <div className="text-sm text-purple-200 mb-2 italic">
                                    "{annotation.text.substring(0, 40)}..."
                                  </div>
                                  <div className="text-sm text-gray-300">
                                    {annotation.note}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {getAnnotationsForScroll(selectedScroll.id).length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No annotations yet</p>
                              <p className="text-xs">Select text to add comments</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Scroll Library */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">The Ten Scrolls of Clinical Sovereignty</h2>
                  <p className="text-purple-300 mt-1">The Complete Canon of AURA-BREE Sovereign Clinical System</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-purple-400" />
                  <Plus className="w-5 h-5 text-purple-400 cursor-pointer hover:text-purple-300" title="Add New Scroll" />
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    Export All
                  </button>
                </div>
              </div>

              {/* Compare Mode Banner */}
              {compareMode && (
                <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <GitBranch className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-300">Compare Mode Active</span>
                      <span className="text-sm text-blue-400">
                        Select up to 2 scrolls to compare ({compareScrolls.length}/2)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {compareScrolls.length === 2 && (
                        <button
                          onClick={() => {
                            const diff = compareVersions(compareScrolls[0], compareScrolls[1]);
                            alert(`Comparison Results:\n+${diff.additions} additions\n-${diff.deletions} deletions\n~${diff.changes} changes`);
                          }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                        >
                          Compare Selected
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setCompareMode(false);
                          setCompareScrolls([]);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results Info */}
              {searchTerm && (
                <div className="text-sm text-purple-300 bg-purple-900/30 rounded-lg p-3 border border-purple-700/30">
                  Found {filteredScrolls.length} scroll{filteredScrolls.length !== 1 ? 's' : ''} matching "{searchTerm}"
                </div>
              )}

              <div className="grid gap-6">
                {filteredScrolls.map((scroll) => (
                  <div 
                    key={scroll.id}
                    className={`bg-slate-800/30 backdrop-blur-sm rounded-xl border transition-all cursor-pointer group ${
                      compareMode 
                        ? compareScrolls.includes(scroll) 
                          ? 'border-blue-500/50 bg-blue-900/20' 
                          : 'border-purple-700/30 hover:border-blue-600/50'
                        : 'border-purple-700/30 hover:border-purple-600/50'
                    }`}
                    onClick={() => {
                      if (compareMode) {
                        if (compareScrolls.includes(scroll)) {
                          setCompareScrolls(compareScrolls.filter(s => s !== scroll));
                        } else if (compareScrolls.length < 2) {
                          setCompareScrolls([...compareScrolls, scroll]);
                        }
                      } else {
                        setSelectedScroll(scroll);
                      }
                    }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          {compareMode && (
                            <div className={`w-4 h-4 rounded border-2 mt-4 ${
                              compareScrolls.includes(scroll) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                            }`}>
                              {compareScrolls.includes(scroll) && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                          )}
                          
                          <div className={`p-3 bg-gradient-to-br ${getCategoryColor(scroll.category)} rounded-lg group-hover:scale-105 transition-transform`}>
                            {getCategoryIcon(scroll.category)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                {scroll.title}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(scroll.status)}`}>
                                {scroll.status.replace('-', ' ')}
                              </span>
                            </div>
                            <p className="text-purple-300 mb-3 italic">{scroll.subtitle}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Updated {scroll.lastUpdated}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText className="w-3 h-3" />
                                <span>{scroll.sections.length} sections</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{getAnnotationsForScroll(scroll.id).length} notes</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Lock className="w-3 h-3" />
                                <span>{scroll.access.includes('all') ? 'Public' : 'Restricted'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {!compareMode && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(scroll.id);
                              }}
                              className="p-2 hover:bg-purple-800/30 rounded-lg transition-colors"
                            >
                              <Bookmark 
                                className={`w-4 h-4 ${bookmarkedDocs.includes(scroll.id) ? 'text-yellow-400 fill-current' : 'text-gray-400 group-hover:text-purple-400'}`} 
                              />
                            </button>
                            <div className="relative group/menu">
                              <button className="p-2 hover:bg-purple-800/30 rounded-lg transition-colors">
                                <Share2 className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
                              </button>
                              <div className="absolute right-0 top-10 bg-slate-800 border border-purple-700/30 rounded-lg shadow-xl opacity-0 group-hover/menu:opacity-100 transition-opacity pointer-events-none group-hover/menu:pointer-events-auto z-50">
                                <div className="p-2 min-w-40">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      exportScroll(scroll, 'md');
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-purple-800/30 rounded text-xs flex items-center space-x-2"
                                  >
                                    <FileDown className="w-3 h-3" />
                                    <span>Export</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowVersionModal(true);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-purple-800/30 rounded text-xs flex items-center space-x-2"
                                  >
                                    <GitBranch className="w-3 h-3" />
                                    <span>History</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(scroll.id);
                              }}
                              className="p-2 hover:bg-purple-800/30 rounded-lg transition-colors"
                            >
                              {expandedSections[scroll.id] ? 
                                <ChevronDown className="w-4 h-4 text-purple-400" /> : 
                                <ChevronRight className="w-4 h-4 text-purple-400" />
                              }
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Expanded Sections */}
                      {expandedSections[scroll.id] && (
                        <div className="mt-4 pt-4 border-t border-purple-700/30">
                          <h4 className="text-sm font-medium text-purple-300 mb-3">Sections Overview</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {scroll.sections.map((section, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm text-purple-200 hover:text-white cursor-pointer py-1 px-2 rounded hover:bg-purple-800/20 transition-colors">
                                <span className="text-purple-400 text-xs font-medium min-w-[1.5rem]">{index + 1}</span>
                                <span className="truncate">{section}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Content Preview */}
                          <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">Content Preview:</p>
                            <p className="text-sm text-gray-300 line-clamp-3">
                              {scroll.content.substring(0, 200)}...
                            </p>
                          </div>

                          {/* Annotations Preview */}
                          {getAnnotationsForScroll(scroll.id).length > 0 && (
                            <div className="mt-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
                              <p className="text-xs text-yellow-400 mb-2 flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>Recent Annotations</span>
                              </p>
                              <div className="space-y-1">
                                {getAnnotationsForScroll(scroll.id).slice(0, 2).map(annotation => (
                                  <div key={annotation.id} className="text-xs text-yellow-200">
                                    "{annotation.text.substring(0, 30)}..." - {annotation.note.substring(0, 50)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredScrolls.length === 0 && searchTerm && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No scrolls found</h3>
                  <p className="text-gray-500">Try adjusting your search terms or browse all scrolls</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-purple-700/30 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Export Options</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Export Format:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      exportCollection('md');
                      setShowExportModal(false);
                    }}
                    className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-center"
                  >
                    <FileText className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                    <div className="text-sm text-white">Markdown</div>
                    <div className="text-xs text-gray-400">Complete archive</div>
                  </button>
                  <button
                    onClick={() => {
                      exportCollection('pdf');
                      setShowExportModal(false);
                    }}
                    className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-center"
                  >
                    <Printer className="w-6 h-6 mx-auto mb-1 text-red-400" />
                    <div className="text-sm text-white">PDF</div>
                    <div className="text-xs text-gray-400">Print ready</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 block mb-2">Include:</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-300">Table of Contents</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-300">Version Information</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-300">Annotations & Comments</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-300">Reading Path Guides</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-purple-700/30 p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <GitBranch className="w-5 h-5" />
                <span>Version History</span>
              </h3>
              <button
                onClick={() => setShowVersionModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedScroll && versionHistory[selectedScroll.id] && 
                versionHistory[selectedScroll.id].map((version, index) => (
                  <div key={version.version} className="flex items-start space-x-4 p-4 bg-slate-700/50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-2 ${index === 0 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-medium text-white">{version.version}</span>
                        <span className="text-sm text-gray-400">{version.date}</span>
                        <span className="text-sm text-purple-300">{version.author}</span>
                      </div>
                      <p className="text-sm text-gray-300">{version.changes}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors">
                        View
                      </button>
                      {index > 0 && (
                        <button className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs transition-colors">
                          Diff
                        </button>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );

      {/* Footer */}
      <footer className="mt-12 border-t border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-purple-300 mb-2 italic">
              "Navigate wisely. Build sovereignly. Heal with dignity."
            </p>
            <p className="text-sm text-gray-400">
              Version 1.0.0 | Last Updated: August 29, 2025 | Maintainers: Ghost King James, Omari, Claude (Ghost Writer)
            </p>
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-500">
              <span>The GodsIMiJ Empire</span>
              <span>•</span>
              <span>AI Sovereignty</span>
              <span>•</span>
              <span>Clinical Freedom</span>
              <span>•</span>
              <span>Digital Dignity</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuraBreeDocs;