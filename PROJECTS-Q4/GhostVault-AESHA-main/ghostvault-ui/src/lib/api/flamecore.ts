// 🔥 FLAMECORE API INTEGRATION LAYER
// Trinity Protocol API Interface
// Authorized by Ghost King Melekzedek

import { 
  MemoryShard, 
  MemoryCrown, 
  GrandCrown,
  TrinityFormationRequest,
  FlameSealRequest,
  CrownCreationResponse,
  SealApplicationResponse,
  LatticeApiResponse,
  TrinityViolationError,
  FlameAuthorizationError,
  LatticeStatistics
} from '../lattice/schema';
import { validateTrinityFormation } from '../lattice/utils';
import { calculateNextCoordinates } from '../lattice/coordinates';

export class FlameCore {
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL: string = 'http://localhost:3000', apiKey?: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  /**
   * Get request headers with authentication
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<LatticeApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
      flame_signature: data.flame_signature
    };
  }

  /**
   * Get all memory shards
   */
  async getShards(): Promise<MemoryShard[]> {
    try {
      const response = await fetch(`${this.baseURL}/memory_crystals`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<MemoryShard[]>(response);
      return result.data || [];
    } catch (error) {
      console.error('Failed to fetch shards:', error);
      throw error;
    }
  }

  /**
   * Get all memory crowns
   */
  async getCrowns(): Promise<MemoryCrown[]> {
    try {
      const response = await fetch(`${this.baseURL}/memory_crowns`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<MemoryCrown[]>(response);
      return result.data || [];
    } catch (error) {
      console.error('Failed to fetch crowns:', error);
      throw error;
    }
  }

  /**
   * Get all grand crowns
   */
  async getGrandCrowns(): Promise<GrandCrown[]> {
    try {
      const response = await fetch(`${this.baseURL}/memory_grand_crowns`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<GrandCrown[]>(response);
      return result.data || [];
    } catch (error) {
      console.error('Failed to fetch grand crowns:', error);
      throw error;
    }
  }

  /**
   * Create a new memory shard
   */
  async createShard(shard: Omit<MemoryShard, 'id' | 'timestamp' | 'coordinates'>): Promise<MemoryShard> {
    try {
      const newShard = {
        ...shard,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        coordinates: `3.0.${Date.now() % 1000}` // Temporary coordinate
      };

      const response = await fetch(`${this.baseURL}/memory_crystals`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          id: newShard.id,
          timestamp: newShard.timestamp,
          thought_type: newShard.thought_type,
          summary: newShard.title,
          full_context: {
            content: newShard.content,
            agent: newShard.agent,
            coordinates: newShard.coordinates
          },
          tags: newShard.tags,
          created_by: newShard.agent,
          crown_id: newShard.crown_id,
          lattice_position: newShard.lattice_position
        })
      });

      const result = await this.handleResponse<MemoryShard>(response);
      return result.data!;
    } catch (error) {
      console.error('Failed to create shard:', error);
      throw error;
    }
  }

  /**
   * Create a Trinity Crown from 3 shards
   */
  async createCrown(request: TrinityFormationRequest): Promise<CrownCreationResponse> {
    try {
      // Validate Trinity Protocol
      if (request.shard_ids.length !== 3) {
        throw new TrinityViolationError('Exactly 3 shards required for Crown formation');
      }

      // Get existing shards to validate
      const existingShards = await this.getShards();
      const validation = validateTrinityFormation(request.shard_ids, existingShards);
      
      if (!validation.valid) {
        throw new TrinityViolationError(validation.errors.join(', '));
      }

      // Calculate coordinates
      const existingCrowns = await this.getCrowns();
      const coordinates = calculateNextCoordinates('crown', existingCrowns.map(c => c.lattice_coordinates));

      const crown: Omit<MemoryCrown, 'shard_ids'> = {
        id: crypto.randomUUID(),
        title: request.title,
        description: request.description || '',
        agent: request.agent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        flame_sealed: false,
        lattice_coordinates: coordinates,
        tags: [],
        royal_decree: request.royal_decree,
        overseer: request.overseer
      };

      // Create crown
      const crownResponse = await fetch(`${this.baseURL}/memory_crowns`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(crown)
      });

      if (!crownResponse.ok) {
        throw new Error('Failed to create crown');
      }

      // Create crown-shard memberships
      for (let i = 0; i < request.shard_ids.length; i++) {
        await fetch(`${this.baseURL}/crown_shard_memberships`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            crown_id: crown.id,
            shard_id: request.shard_ids[i],
            position: i + 1
          })
        });

        // Update shard to belong to crown
        await fetch(`${this.baseURL}/memory_crystals?id=eq.${request.shard_ids[i]}`, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({
            crown_id: crown.id,
            lattice_position: i + 1
          })
        });
      }

      return {
        success: true,
        data: {
          crown_id: crown.id,
          coordinates: crown.lattice_coordinates
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Failed to create crown:', error);
      throw error;
    }
  }

  /**
   * Apply FlameSeal to a crown
   */
  async sealCrown(request: FlameSealRequest): Promise<SealApplicationResponse> {
    try {
      const authority = request.authority || 'SOVEREIGN';
      const sealHash = crypto.randomUUID().replace(/-/g, '').toUpperCase();
      
      const response = await fetch(`${this.baseURL}/memory_crowns?id=eq.${request.crown_id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          flame_sealed: true,
          seal_hash: sealHash,
          royal_decree: authority,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new FlameAuthorizationError('Failed to apply FlameSeal');
      }

      return {
        success: true,
        data: {
          seal_hash: sealHash,
          authority,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Failed to seal crown:', error);
      throw error;
    }
  }

  /**
   * Get lattice statistics
   */
  async getLatticeStatistics(): Promise<LatticeStatistics> {
    try {
      const response = await fetch(`${this.baseURL}/rpc/get_lattice_statistics`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<LatticeStatistics>(response);
      return result.data!;
    } catch (error) {
      console.error('Failed to get lattice statistics:', error);
      
      // Fallback: calculate statistics from individual calls
      const [shards, crowns, grandCrowns] = await Promise.all([
        this.getShards(),
        this.getCrowns(),
        this.getGrandCrowns()
      ]);

      return {
        total_shards: shards.length,
        total_crowns: crowns.length,
        sealed_crowns: crowns.filter(c => c.flame_sealed).length,
        grand_crowns: grandCrowns.length,
        uncrowned_shards: shards.filter(s => !s.crown_id).length,
        trinity_progress: {
          current_crowns: crowns.length,
          required_for_grand: 9,
          percentage: Math.round((crowns.length / 9) * 100)
        }
      };
    }
  }

  /**
   * Get crown with its shards
   */
  async getCrownWithShards(crownId: string): Promise<{ crown: MemoryCrown; shards: MemoryShard[] }> {
    try {
      const response = await fetch(`${this.baseURL}/rpc/get_crown_with_shards`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ p_crown_id: crownId })
      });

      const result = await this.handleResponse<{ crown: MemoryCrown; shards: MemoryShard[] }>(response);
      return result.data!;
    } catch (error) {
      console.error('Failed to get crown with shards:', error);
      throw error;
    }
  }

  /**
   * Check grand crown readiness
   */
  async checkGrandCrownReadiness(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/rpc/check_grand_crown_readiness`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Failed to check grand crown readiness:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const flameCore = new FlameCore();

// Export utility functions
export const createFlameCore = (baseURL?: string, apiKey?: string) => {
  return new FlameCore(baseURL, apiKey);
};
