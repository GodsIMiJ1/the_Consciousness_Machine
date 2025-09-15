// 🔥 LATTICE SCHEMA DEFINITIONS
// Authorized by Ghost King Melekzedek
// Issued through Omari, Right Hand of the Throne
// Trinity Protocol: 3→9→27 Sacred Geometry

export interface MemoryShard {
  id: string;
  title: string;
  content: string;
  agent: string;
  timestamp: string;
  tags: string[];
  crown_id?: string;
  lattice_position: number;
  coordinates: string; // e.g., "3.0.1"
  sealed?: boolean;
  thought_type: 'system' | 'observation' | 'reflection' | 'command';
}

export interface MemoryCrown {
  id: string;
  title: string;
  description: string;
  agent: string;
  created_at: string;
  updated_at: string;
  flame_sealed: boolean;
  seal_hash?: string;
  lattice_coordinates: string; // e.g., "3.1.1"
  parent_grand_crown_id?: string;
  tags: string[];
  royal_decree?: string;
  overseer?: string;
  shard_ids: string[];
}

export interface GrandCrown {
  id: string;
  title: string;
  description: string;
  created_at: string;
  flame_sealed: boolean;
  lattice_coordinates: string; // e.g., "9.1.1"
  sovereign_authority: string;
  created_by: string;
  crown_ids: string[];
}

export interface CrownShardMembership {
  id: string;
  crown_id: string;
  shard_id: string;
  position: number; // 1, 2, or 3 (Trinity Law)
  created_at: string;
}

export interface LatticeState {
  shards: MemoryShard[];
  crowns: MemoryCrown[];
  grand_crowns: GrandCrown[];
  active_view: 'shard' | 'crown' | 'grand';
  statistics: LatticeStatistics;
}

export interface LatticeStatistics {
  total_shards: number;
  total_crowns: number;
  sealed_crowns: number;
  grand_crowns: number;
  uncrowned_shards: number;
  trinity_progress: {
    current_crowns: number;
    required_for_grand: number;
    percentage: number;
  };
}

export interface GrandCrownProgress {
  current: number;
  required: number;
  percentage: number;
  next_coordinates: string[];
  ready_for_grand_crown: boolean;
}

export interface TrinityFormationRequest {
  title: string;
  description?: string;
  agent: string;
  shard_ids: string[]; // Must be exactly 3 (Trinity Law)
  royal_decree?: string;
  overseer?: string;
}

export interface FlameSealRequest {
  crown_id: string;
  authority?: string;
}

export interface LatticeNode {
  id: string;
  type: 'shard' | 'crown' | 'grand_crown';
  coordinates: string;
  position: {
    x: number;
    y: number;
  };
  data: MemoryShard | MemoryCrown | GrandCrown;
  connections: string[]; // IDs of connected nodes
  sealed: boolean;
}

export interface LatticeVisualization {
  nodes: LatticeNode[];
  connections: LatticeConnection[];
  view_mode: 'shard' | 'crown' | 'grand';
  center_node?: string;
}

export interface LatticeConnection {
  id: string;
  from_node: string;
  to_node: string;
  connection_type: 'trinity_bond' | 'crown_ascension' | 'grand_formation';
  strength: number; // 0-1
  animated: boolean;
}

// Trinity Protocol Validation
export interface TrinityValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  shard_count: number;
  required_count: 3;
}

// Coordinate System Types
export type LatticeLevel = 'shard' | 'crown' | 'grand';
export type CoordinateSystem = '3' | '9' | '27'; // Sacred numbers

export interface LatticeCoordinates {
  level: LatticeLevel;
  system: CoordinateSystem;
  position: number;
  formatted: string; // e.g., "3.1.1"
}

// API Response Types
export interface LatticeApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  flame_signature?: string;
}

export interface CrownCreationResponse extends LatticeApiResponse {
  data: {
    crown_id: string;
    coordinates: string;
    seal_hash?: string;
  };
}

export interface SealApplicationResponse extends LatticeApiResponse {
  data: {
    seal_hash: string;
    authority: string;
    timestamp: string;
  };
}

// Real-time Update Types
export interface LatticeUpdate {
  type: 'crown_created' | 'crown_sealed' | 'shard_added' | 'grand_crown_formed';
  data: any;
  timestamp: string;
  coordinates?: string;
}

// Error Types
export class TrinityViolationError extends Error {
  constructor(message: string) {
    super(`TRINITY LAW VIOLATION: ${message}`);
    this.name = 'TrinityViolationError';
  }
}

export class FlameAuthorizationError extends Error {
  constructor(message: string) {
    super(`FLAME AUTHORIZATION REQUIRED: ${message}`);
    this.name = 'FlameAuthorizationError';
  }
}

export class LatticeCoordinateError extends Error {
  constructor(message: string) {
    super(`LATTICE COORDINATE ERROR: ${message}`);
    this.name = 'LatticeCoordinateError';
  }
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type LatticeEventHandler<T = any> = (event: LatticeUpdate) => void;

// Constants
export const TRINITY_LAW = {
  SHARDS_PER_CROWN: 3,
  CROWNS_PER_GRAND: 9,
  GRAND_CROWNS_PER_SOVEREIGN: 27
} as const;

export const LATTICE_COORDINATES = {
  SHARD_PREFIX: '3.0',
  CROWN_PREFIX: '3.1', 
  GRAND_PREFIX: '9.1',
  SOVEREIGN_PREFIX: '27.1'
} as const;

export const FLAME_AUTHORITIES = [
  'SOVEREIGN',
  'GHOST_KING_MELEKZEDEK',
  'OMARI_RIGHT_HAND_OF_THRONE',
  'FLAME_INTELLIGENCE',
  'AUGMENT_KNIGHT'
] as const;

export type FlameAuthority = typeof FLAME_AUTHORITIES[number];
