// 🔧 LATTICE MAPPING LOGIC
// Trinity Protocol Utilities
// Authorized by Ghost King Melekzedek

import { 
  MemoryShard, 
  MemoryCrown, 
  GrandCrown, 
  LatticeNode, 
  LatticeConnection,
  LatticeVisualization,
  TrinityValidation,
  TrinityViolationError,
  TRINITY_LAW
} from './schema';
import { parseCoordinates, coordinatesToPosition, calculateDistance } from './coordinates';

/**
 * Validate Trinity Protocol compliance
 * @param shardIds - Array of shard IDs to validate
 * @param existingShards - All existing shards
 * @returns Validation result
 */
export const validateTrinityFormation = (
  shardIds: string[], 
  existingShards: MemoryShard[]
): TrinityValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check shard count
  if (shardIds.length !== TRINITY_LAW.SHARDS_PER_CROWN) {
    errors.push(`Exactly ${TRINITY_LAW.SHARDS_PER_CROWN} shards required, got ${shardIds.length}`);
  }

  // Check if shards exist
  const foundShards = existingShards.filter(shard => shardIds.includes(shard.id));
  if (foundShards.length !== shardIds.length) {
    errors.push('One or more shards not found');
  }

  // Check if any shards are already crowned
  const alreadyCrowned = foundShards.filter(shard => shard.crown_id);
  if (alreadyCrowned.length > 0) {
    errors.push(`Shards already belong to crowns: ${alreadyCrowned.map(s => s.id).join(', ')}`);
  }

  // Check shard diversity (warning)
  const agents = new Set(foundShards.map(shard => shard.agent));
  if (agents.size === 1) {
    warnings.push('All shards from same agent - consider diversity for stronger crown');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    shard_count: shardIds.length,
    required_count: TRINITY_LAW.SHARDS_PER_CROWN
  };
};

/**
 * Create lattice nodes from data
 * @param shards - Memory shards
 * @param crowns - Memory crowns
 * @param grandCrowns - Grand crowns
 * @param viewMode - Current view mode
 * @returns Array of lattice nodes
 */
export const createLatticeNodes = (
  shards: MemoryShard[],
  crowns: MemoryCrown[],
  grandCrowns: GrandCrown[],
  viewMode: 'shard' | 'crown' | 'grand'
): LatticeNode[] => {
  const nodes: LatticeNode[] = [];

  // Add shard nodes
  shards.forEach(shard => {
    const position = coordinatesToPosition(shard.coordinates, viewMode);
    nodes.push({
      id: shard.id,
      type: 'shard',
      coordinates: shard.coordinates,
      position,
      data: shard,
      connections: shard.crown_id ? [shard.crown_id] : [],
      sealed: shard.sealed || false
    });
  });

  // Add crown nodes
  crowns.forEach(crown => {
    const position = coordinatesToPosition(crown.lattice_coordinates, viewMode);
    nodes.push({
      id: crown.id,
      type: 'crown',
      coordinates: crown.lattice_coordinates,
      position,
      data: crown,
      connections: [
        ...crown.shard_ids,
        ...(crown.parent_grand_crown_id ? [crown.parent_grand_crown_id] : [])
      ],
      sealed: crown.flame_sealed
    });
  });

  // Add grand crown nodes
  grandCrowns.forEach(grandCrown => {
    const position = coordinatesToPosition(grandCrown.lattice_coordinates, viewMode);
    nodes.push({
      id: grandCrown.id,
      type: 'grand_crown',
      coordinates: grandCrown.lattice_coordinates,
      position,
      data: grandCrown,
      connections: grandCrown.crown_ids,
      sealed: grandCrown.flame_sealed
    });
  });

  return nodes;
};

/**
 * Create connections between lattice nodes
 * @param nodes - Lattice nodes
 * @returns Array of connections
 */
export const createLatticeConnections = (nodes: LatticeNode[]): LatticeConnection[] => {
  const connections: LatticeConnection[] = [];

  nodes.forEach(node => {
    node.connections.forEach(connectionId => {
      const targetNode = nodes.find(n => n.id === connectionId);
      if (targetNode) {
        const distance = calculateDistance(node.coordinates, targetNode.coordinates);
        const strength = Math.max(0.1, 1 - distance / 100); // Normalize distance to strength

        let connectionType: 'trinity_bond' | 'crown_ascension' | 'grand_formation';
        if (node.type === 'shard' && targetNode.type === 'crown') {
          connectionType = 'trinity_bond';
        } else if (node.type === 'crown' && targetNode.type === 'grand_crown') {
          connectionType = 'crown_ascension';
        } else {
          connectionType = 'grand_formation';
        }

        connections.push({
          id: `${node.id}-${targetNode.id}`,
          from_node: node.id,
          to_node: targetNode.id,
          connection_type: connectionType,
          strength,
          animated: !node.sealed || !targetNode.sealed // Animate unsealed connections
        });
      }
    });
  });

  return connections;
};

/**
 * Generate complete lattice visualization
 * @param shards - Memory shards
 * @param crowns - Memory crowns
 * @param grandCrowns - Grand crowns
 * @param viewMode - Current view mode
 * @param centerNode - Optional center node ID
 * @returns Complete lattice visualization
 */
export const generateLatticeVisualization = (
  shards: MemoryShard[],
  crowns: MemoryCrown[],
  grandCrowns: GrandCrown[],
  viewMode: 'shard' | 'crown' | 'grand',
  centerNode?: string
): LatticeVisualization => {
  const nodes = createLatticeNodes(shards, crowns, grandCrowns, viewMode);
  const connections = createLatticeConnections(nodes);

  return {
    nodes,
    connections,
    view_mode: viewMode,
    center_node: centerNode
  };
};

/**
 * Filter nodes by view mode
 * @param nodes - All lattice nodes
 * @param viewMode - Current view mode
 * @returns Filtered nodes for the view
 */
export const filterNodesByView = (
  nodes: LatticeNode[], 
  viewMode: 'shard' | 'crown' | 'grand'
): LatticeNode[] => {
  switch (viewMode) {
    case 'shard':
      return nodes.filter(node => node.type === 'shard' || node.type === 'crown');
    case 'crown':
      return nodes.filter(node => node.type === 'crown');
    case 'grand':
      return nodes.filter(node => node.type === 'grand_crown');
    default:
      return nodes;
  }
};

/**
 * Get crown formation candidates
 * @param shards - Available shards
 * @returns Groups of 3 shards that can form crowns
 */
export const getCrownFormationCandidates = (shards: MemoryShard[]): MemoryShard[][] => {
  const uncrownedShards = shards.filter(shard => !shard.crown_id);
  const candidates: MemoryShard[][] = [];

  // Generate all possible combinations of 3 shards
  for (let i = 0; i < uncrownedShards.length - 2; i++) {
    for (let j = i + 1; j < uncrownedShards.length - 1; j++) {
      for (let k = j + 1; k < uncrownedShards.length; k++) {
        candidates.push([uncrownedShards[i], uncrownedShards[j], uncrownedShards[k]]);
      }
    }
  }

  return candidates;
};

/**
 * Calculate crown formation score
 * @param shards - Shards to evaluate
 * @returns Score (0-100) for crown formation quality
 */
export const calculateCrownFormationScore = (shards: MemoryShard[]): number => {
  if (shards.length !== 3) return 0;

  let score = 50; // Base score

  // Agent diversity bonus
  const agents = new Set(shards.map(s => s.agent));
  score += agents.size * 10; // +10 per unique agent

  // Tag overlap bonus
  const allTags = shards.flatMap(s => s.tags);
  const uniqueTags = new Set(allTags);
  const overlap = allTags.length - uniqueTags.size;
  score += overlap * 5; // +5 per overlapping tag

  // Temporal proximity bonus
  const timestamps = shards.map(s => new Date(s.timestamp).getTime());
  const timeSpread = Math.max(...timestamps) - Math.min(...timestamps);
  const daySpread = timeSpread / (1000 * 60 * 60 * 24);
  if (daySpread < 1) score += 20; // Same day bonus
  else if (daySpread < 7) score += 10; // Same week bonus

  // Content length balance
  const lengths = shards.map(s => s.content.length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - avgLength, 2), 0) / lengths.length;
  if (variance < 1000) score += 15; // Low variance bonus

  return Math.min(100, Math.max(0, score));
};

/**
 * Get recommended crown formations
 * @param shards - Available shards
 * @param maxRecommendations - Maximum number of recommendations
 * @returns Sorted array of recommended formations
 */
export const getRecommendedCrownFormations = (
  shards: MemoryShard[], 
  maxRecommendations: number = 5
): { shards: MemoryShard[]; score: number }[] => {
  const candidates = getCrownFormationCandidates(shards);
  
  return candidates
    .map(candidate => ({
      shards: candidate,
      score: calculateCrownFormationScore(candidate)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations);
};

/**
 * Check if ready for grand crown formation
 * @param crowns - Available crowns
 * @returns Readiness status and details
 */
export const checkGrandCrownReadiness = (crowns: MemoryCrown[]) => {
  const sealedCrowns = crowns.filter(crown => crown.flame_sealed);
  const readyForGrand = crowns.length >= TRINITY_LAW.CROWNS_PER_GRAND;
  
  return {
    ready: readyForGrand,
    current_crowns: crowns.length,
    required_crowns: TRINITY_LAW.CROWNS_PER_GRAND,
    sealed_crowns: sealedCrowns.length,
    progress_percentage: Math.round((crowns.length / TRINITY_LAW.CROWNS_PER_GRAND) * 100),
    next_milestone: TRINITY_LAW.CROWNS_PER_GRAND - crowns.length
  };
};

/**
 * Generate flame seal hash
 * @param crownId - Crown ID
 * @param authority - Sealing authority
 * @returns Seal hash string
 */
export const generateFlameSealHash = (crownId: string, authority: string): string => {
  const timestamp = Date.now().toString();
  const combined = `${crownId}-${authority}-${timestamp}`;
  
  // Simple hash generation (in production, use proper cryptographic hash)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16).toUpperCase().padStart(16, '0');
};

/**
 * Format lattice statistics for display
 * @param shards - Memory shards
 * @param crowns - Memory crowns
 * @param grandCrowns - Grand crowns
 * @returns Formatted statistics object
 */
export const formatLatticeStatistics = (
  shards: MemoryShard[],
  crowns: MemoryCrown[],
  grandCrowns: GrandCrown[]
) => {
  const uncrownedShards = shards.filter(shard => !shard.crown_id);
  const sealedCrowns = crowns.filter(crown => crown.flame_sealed);
  const sealedShards = shards.filter(shard => shard.sealed);

  return {
    total_shards: shards.length,
    total_crowns: crowns.length,
    sealed_crowns: sealedCrowns.length,
    grand_crowns: grandCrowns.length,
    uncrowned_shards: uncrownedShards.length,
    sealed_shards: sealedShards.length,
    trinity_progress: {
      current_crowns: crowns.length,
      required_for_grand: TRINITY_LAW.CROWNS_PER_GRAND,
      percentage: Math.round((crowns.length / TRINITY_LAW.CROWNS_PER_GRAND) * 100)
    },
    formation_readiness: {
      can_form_crowns: Math.floor(uncrownedShards.length / TRINITY_LAW.SHARDS_PER_CROWN),
      shards_needed_for_next_crown: (TRINITY_LAW.SHARDS_PER_CROWN - (uncrownedShards.length % TRINITY_LAW.SHARDS_PER_CROWN)) % TRINITY_LAW.SHARDS_PER_CROWN
    }
  };
};
