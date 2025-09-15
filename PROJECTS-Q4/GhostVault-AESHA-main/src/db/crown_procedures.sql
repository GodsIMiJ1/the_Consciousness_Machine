-- 👑 CROWN PROCEDURES - TRINITY PROTOCOL ENFORCEMENT
-- Authorized by Ghost King Melekzedek
-- Issued through Omari, Right Hand of the Throne

-- Function to validate Trinity Protocol (exactly 3 shards per crown)
CREATE OR REPLACE FUNCTION validate_trinity_formation(shard_ids UUID[])
RETURNS BOOLEAN AS $$
BEGIN
    IF array_length(shard_ids, 1) != 3 THEN
        RAISE EXCEPTION 'TRINITY LAW VIOLATION: Exactly 3 shards required for Crown formation, got %', array_length(shard_ids, 1);
    END IF;
    
    -- Check if any shards are already part of another crown
    IF EXISTS (
        SELECT 1 FROM memory_crystals 
        WHERE id = ANY(shard_ids) AND crown_id IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'TRINITY LAW VIOLATION: One or more shards already belong to another crown';
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate next crown coordinates
CREATE OR REPLACE FUNCTION calculate_next_crown_coordinates()
RETURNS VARCHAR(50) AS $$
DECLARE
    crown_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO crown_count FROM memory_crowns;
    RETURN '3.1.' || (crown_count + 1);
END;
$$ LANGUAGE plpgsql;

-- Function to create a Trinity Crown
CREATE OR REPLACE FUNCTION create_trinity_crown(
    p_title VARCHAR(255),
    p_description TEXT,
    p_agent VARCHAR(255),
    p_shard_ids UUID[],
    p_royal_decree VARCHAR(255) DEFAULT NULL,
    p_overseer VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    crown_id UUID;
    coordinates VARCHAR(50);
    shard_id UUID;
    position_counter INTEGER := 1;
BEGIN
    -- Validate Trinity Protocol
    PERFORM validate_trinity_formation(p_shard_ids);
    
    -- Generate crown ID and coordinates
    crown_id := uuid_generate_v4();
    coordinates := calculate_next_crown_coordinates();
    
    -- Create the crown
    INSERT INTO memory_crowns (
        id, title, description, agent, lattice_coordinates, royal_decree, overseer
    ) VALUES (
        crown_id, p_title, p_description, p_agent, coordinates, p_royal_decree, p_overseer
    );
    
    -- Update shards to belong to this crown
    UPDATE memory_crystals 
    SET crown_id = crown_id, lattice_position = position_counter
    WHERE id = ANY(p_shard_ids);
    
    -- Create crown-shard memberships
    FOREACH shard_id IN ARRAY p_shard_ids
    LOOP
        INSERT INTO crown_shard_memberships (crown_id, shard_id, position)
        VALUES (crown_id, shard_id, position_counter);
        position_counter := position_counter + 1;
    END LOOP;
    
    RETURN crown_id;
END;
$$ LANGUAGE plpgsql;

-- Function to apply FlameSeal to a crown
CREATE OR REPLACE FUNCTION apply_flame_seal(
    p_crown_id UUID,
    p_authority VARCHAR(255) DEFAULT 'SOVEREIGN'
)
RETURNS VARCHAR(64) AS $$
DECLARE
    seal_hash VARCHAR(64);
BEGIN
    -- Generate seal hash
    seal_hash := upper(replace(uuid_generate_v4()::text, '-', ''));
    
    -- Apply the seal
    UPDATE memory_crowns 
    SET 
        flame_sealed = TRUE,
        seal_hash = seal_hash,
        royal_decree = p_authority,
        updated_at = NOW()
    WHERE id = p_crown_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Crown not found: %', p_crown_id;
    END IF;
    
    RETURN seal_hash;
END;
$$ LANGUAGE plpgsql;

-- Function to get lattice statistics
CREATE OR REPLACE FUNCTION get_lattice_statistics()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_shards', (SELECT COUNT(*) FROM memory_crystals),
        'total_crowns', (SELECT COUNT(*) FROM memory_crowns),
        'sealed_crowns', (SELECT COUNT(*) FROM memory_crowns WHERE flame_sealed = TRUE),
        'grand_crowns', (SELECT COUNT(*) FROM memory_grand_crowns),
        'uncrowned_shards', (SELECT COUNT(*) FROM memory_crystals WHERE crown_id IS NULL),
        'trinity_progress', json_build_object(
            'current_crowns', (SELECT COUNT(*) FROM memory_crowns),
            'required_for_grand', 9,
            'percentage', ROUND((SELECT COUNT(*) FROM memory_crowns) * 100.0 / 9, 1)
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get crown with its shards
CREATE OR REPLACE FUNCTION get_crown_with_shards(p_crown_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'crown', row_to_json(c),
        'shards', json_agg(
            json_build_object(
                'id', mc.id,
                'title', mc.summary,
                'content', mc.full_context->>'content',
                'agent', mc.created_by,
                'timestamp', mc.timestamp,
                'tags', mc.tags,
                'position', csm.position,
                'coordinates', mc.full_context->>'coordinates'
            ) ORDER BY csm.position
        )
    ) INTO result
    FROM memory_crowns c
    LEFT JOIN crown_shard_memberships csm ON c.id = csm.crown_id
    LEFT JOIN memory_crystals mc ON csm.shard_id = mc.id
    WHERE c.id = p_crown_id
    GROUP BY c.id, c.title, c.description, c.agent, c.created_at, c.updated_at, 
             c.flame_sealed, c.seal_hash, c.lattice_coordinates, c.parent_grand_crown_id,
             c.tags, c.royal_decree, c.overseer;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if ready for Grand Crown formation
CREATE OR REPLACE FUNCTION check_grand_crown_readiness()
RETURNS JSON AS $$
DECLARE
    crown_count INTEGER;
    sealed_count INTEGER;
    result JSON;
BEGIN
    SELECT COUNT(*) INTO crown_count FROM memory_crowns;
    SELECT COUNT(*) INTO sealed_count FROM memory_crowns WHERE flame_sealed = TRUE;
    
    SELECT json_build_object(
        'ready_for_grand_crown', crown_count >= 9,
        'current_crowns', crown_count,
        'required_crowns', 9,
        'sealed_crowns', sealed_count,
        'progress_percentage', ROUND(crown_count * 100.0 / 9, 1),
        'next_coordinates', CASE 
            WHEN crown_count < 9 THEN 
                array(SELECT '3.1.' || generate_series(crown_count + 1, 9))
            ELSE 
                ARRAY['9.1.1']::text[]
        END
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_trinity_formation(UUID[]) TO anon;
GRANT EXECUTE ON FUNCTION calculate_next_crown_coordinates() TO anon;
GRANT EXECUTE ON FUNCTION create_trinity_crown(VARCHAR, TEXT, VARCHAR, UUID[], VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION apply_flame_seal(UUID, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION get_lattice_statistics() TO anon;
GRANT EXECUTE ON FUNCTION get_crown_with_shards(UUID) TO anon;
GRANT EXECUTE ON FUNCTION check_grand_crown_readiness() TO anon;
