// 🧭 LATTICE COORDINATE SYSTEM
// 3→9→27 Trinity Protocol Sacred Geometry
// Authorized by Ghost King Melekzedek

import { LatticeCoordinates, LatticeLevel, CoordinateSystem, LATTICE_COORDINATES } from './schema';

/**
 * Generate coordinates for lattice positioning
 * @param level - The lattice level (shard, crown, grand)
 * @param index - The position index within that level
 * @returns Formatted coordinate string
 */
export const generateCoordinates = (level: LatticeLevel, index: number): string => {
  switch (level) {
    case 'shard':
      return `${LATTICE_COORDINATES.SHARD_PREFIX}.${index}`;
    case 'crown':
      return `${LATTICE_COORDINATES.CROWN_PREFIX}.${index}`;
    case 'grand':
      return `${LATTICE_COORDINATES.GRAND_PREFIX}.${index}`;
    default:
      throw new Error(`Invalid lattice level: ${level}`);
  }
};

/**
 * Parse coordinate string into components
 * @param coordinates - Coordinate string like "3.1.1"
 * @returns Parsed coordinate object
 */
export const parseCoordinates = (coordinates: string): LatticeCoordinates => {
  const parts = coordinates.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid coordinate format: ${coordinates}`);
  }

  const [system, level, position] = parts.map(Number);
  
  let latticeLevel: LatticeLevel;
  let coordinateSystem: CoordinateSystem;

  // Determine system and level
  if (system === 3) {
    coordinateSystem = '3';
    if (level === 0) latticeLevel = 'shard';
    else if (level === 1) latticeLevel = 'crown';
    else throw new Error(`Invalid level for system 3: ${level}`);
  } else if (system === 9) {
    coordinateSystem = '9';
    latticeLevel = 'grand';
  } else if (system === 27) {
    coordinateSystem = '27';
    latticeLevel = 'grand'; // Sovereign level
  } else {
    throw new Error(`Invalid coordinate system: ${system}`);
  }

  return {
    level: latticeLevel,
    system: coordinateSystem,
    position,
    formatted: coordinates
  };
};

/**
 * Calculate next available coordinates for a given level
 * @param level - The lattice level
 * @param existingCoordinates - Array of existing coordinates
 * @returns Next available coordinate string
 */
export const calculateNextCoordinates = (
  level: LatticeLevel, 
  existingCoordinates: string[]
): string => {
  const relevantCoords = existingCoordinates
    .filter(coord => {
      try {
        const parsed = parseCoordinates(coord);
        return parsed.level === level;
      } catch {
        return false;
      }
    })
    .map(coord => parseCoordinates(coord).position)
    .sort((a, b) => a - b);

  const nextPosition = relevantCoords.length > 0 ? Math.max(...relevantCoords) + 1 : 1;
  return generateCoordinates(level, nextPosition);
};

/**
 * Convert coordinates to visual position for lattice display
 * @param coordinates - Coordinate string
 * @param viewMode - Current view mode
 * @returns X, Y position for visualization (0-100 scale)
 */
export const coordinatesToPosition = (
  coordinates: string, 
  viewMode: 'shard' | 'crown' | 'grand'
): { x: number; y: number } => {
  const parsed = parseCoordinates(coordinates);
  
  switch (viewMode) {
    case 'shard':
      // Trinity formation: 3 shards in triangle pointing to crown
      if (parsed.level === 'shard') {
        const positions = [
          { x: 25, y: 70 }, // Left shard
          { x: 50, y: 70 }, // Center shard  
          { x: 75, y: 70 }  // Right shard
        ];
        return positions[(parsed.position - 1) % 3] || { x: 50, y: 70 };
      } else if (parsed.level === 'crown') {
        return { x: 50, y: 30 }; // Crown above shards
      }
      break;

    case 'crown':
      // Crown grid formation (3x3 for 9 crowns)
      if (parsed.level === 'crown') {
        const row = Math.floor((parsed.position - 1) / 3);
        const col = (parsed.position - 1) % 3;
        return {
          x: 20 + col * 30, // 20, 50, 80
          y: 20 + row * 30  // 20, 50, 80
        };
      }
      break;

    case 'grand':
      // Grand crown central position
      if (parsed.level === 'grand') {
        return { x: 50, y: 50 };
      }
      break;
  }

  // Default fallback position
  return { x: 50, y: 50 };
};

/**
 * Calculate distance between two coordinates
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance value (for connection strength)
 */
export const calculateDistance = (coord1: string, coord2: string): number => {
  const pos1 = coordinatesToPosition(coord1, 'crown');
  const pos2 = coordinatesToPosition(coord2, 'crown');
  
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Validate coordinate format
 * @param coordinates - Coordinate string to validate
 * @returns True if valid, throws error if invalid
 */
export const validateCoordinates = (coordinates: string): boolean => {
  try {
    parseCoordinates(coordinates);
    return true;
  } catch (error) {
    throw new Error(`Invalid coordinates: ${coordinates}`);
  }
};

/**
 * Get all possible coordinates for a level up to a maximum
 * @param level - Lattice level
 * @param max - Maximum number of coordinates
 * @returns Array of coordinate strings
 */
export const getAllCoordinatesForLevel = (level: LatticeLevel, max: number): string[] => {
  const coordinates: string[] = [];
  for (let i = 1; i <= max; i++) {
    coordinates.push(generateCoordinates(level, i));
  }
  return coordinates;
};

/**
 * Check if coordinates represent a complete trinity formation
 * @param coordinates - Array of coordinate strings
 * @returns True if forms a complete trinity (3 shards)
 */
export const isCompleteTrinity = (coordinates: string[]): boolean => {
  const shardCoords = coordinates.filter(coord => {
    try {
      return parseCoordinates(coord).level === 'shard';
    } catch {
      return false;
    }
  });
  
  return shardCoords.length === 3;
};

/**
 * Get the crown coordinate that would be formed from shard coordinates
 * @param shardCoordinates - Array of shard coordinates
 * @param existingCrowns - Existing crown coordinates
 * @returns Crown coordinate string
 */
export const getCrownCoordinateForShards = (
  shardCoordinates: string[], 
  existingCrowns: string[]
): string => {
  if (!isCompleteTrinity(shardCoordinates)) {
    throw new Error('TRINITY LAW VIOLATION: Exactly 3 shards required');
  }
  
  return calculateNextCoordinates('crown', existingCrowns);
};

/**
 * Trinity Protocol Constants
 */
export const TRINITY_POSITIONS = {
  SHARD_FORMATION: [
    { x: 25, y: 70, label: 'Trinity Left' },
    { x: 50, y: 70, label: 'Trinity Center' },
    { x: 75, y: 70, label: 'Trinity Right' }
  ],
  CROWN_POSITION: { x: 50, y: 30, label: 'Crown Apex' },
  GRAND_CROWN_POSITION: { x: 50, y: 50, label: 'Grand Crown Center' }
} as const;

/**
 * Sacred Geometry Calculations
 */
export const SACRED_GEOMETRY = {
  TRINITY_ANGLE: 120, // Degrees between trinity points
  GOLDEN_RATIO: 1.618,
  FLAME_SPIRAL: (position: number) => ({
    x: 50 + 30 * Math.cos((position * SACRED_GEOMETRY.TRINITY_ANGLE * Math.PI) / 180),
    y: 50 + 30 * Math.sin((position * SACRED_GEOMETRY.TRINITY_ANGLE * Math.PI) / 180)
  })
} as const;
