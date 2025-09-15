import { 
  MemoryQueryPayload, 
  MemoryAddPayload, 
  MemoryUpdatePayload, 
  MemoryDeletePayload 
} from '../schemas/envelope.js';
import { emitMemoryChanged } from '../handlers/emit.js';

/**
 * Memory domain handler - integrates with existing Omari memory system
 */
export class MemoryHandler {
  /**
   * Query memory blocks
   */
  static async queryMemory(deviceId: string, payload: MemoryQueryPayload): Promise<any> {
    try {
      const { filter, limit } = payload;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (filter?.category) params.append('category', filter.category);
      if (filter?.min_importance) params.append('min_importance', filter.min_importance.toString());
      if (filter?.active_only !== undefined) params.append('active_only', filter.active_only.toString());

      const response = await fetch(`http://localhost:5000/api/memory/${deviceId}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to query memory: ${response.status}`);
      }

      const memoryBlocks = await response.json();
      
      // Apply filters if needed (server-side filtering preferred)
      let filteredBlocks = memoryBlocks;
      
      if (filter?.active_only) {
        filteredBlocks = filteredBlocks.filter((block: any) => block.isActive);
      }
      
      if (filter?.min_importance) {
        filteredBlocks = filteredBlocks.filter((block: any) => block.importance >= filter.min_importance!);
      }
      
      if (filter?.category) {
        filteredBlocks = filteredBlocks.filter((block: any) => block.category === filter.category);
      }

      // Sort by importance (descending) and limit results
      filteredBlocks.sort((a: any, b: any) => b.importance - a.importance);
      
      if (limit) {
        filteredBlocks = filteredBlocks.slice(0, limit);
      }

      return {
        memory_blocks: filteredBlocks,
        total_count: memoryBlocks.length,
        filtered_count: filteredBlocks.length
      };
    } catch (error) {
      console.error('Memory query error:', error);
      throw new Error(`Memory query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add new memory block
   */
  static async addMemory(deviceId: string, payload: MemoryAddPayload): Promise<any> {
    try {
      const { content, category, importance, active } = payload;

      // Validate importance range
      if (importance < 1 || importance > 10) {
        throw new Error('Importance must be between 1 and 10');
      }

      // Validate content length
      if (content.length > 8000) {
        throw new Error('Content exceeds maximum length of 8000 characters');
      }

      const memoryData = {
        deviceId,
        title: this.generateTitle(content),
        content,
        category,
        importance,
        isActive: active !== false // Default to true
      };

      const response = await fetch('http://localhost:5000/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memoryData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to add memory: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const newMemoryBlock = await response.json();

      // Emit memory changed event
      await emitMemoryChanged(deviceId, 'created', newMemoryBlock);

      return {
        memory_block: newMemoryBlock,
        message: 'Memory block created successfully'
      };
    } catch (error) {
      console.error('Memory add error:', error);
      throw new Error(`Memory creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update existing memory block
   */
  static async updateMemory(deviceId: string, payload: MemoryUpdatePayload): Promise<any> {
    try {
      const { id, content, importance, active } = payload;

      // Validate importance range if provided
      if (importance !== undefined && (importance < 1 || importance > 10)) {
        throw new Error('Importance must be between 1 and 10');
      }

      // Validate content length if provided
      if (content !== undefined && content.length > 8000) {
        throw new Error('Content exceeds maximum length of 8000 characters');
      }

      const updateData: any = {};
      if (content !== undefined) {
        updateData.content = content;
        updateData.title = this.generateTitle(content);
      }
      if (importance !== undefined) updateData.importance = importance;
      if (active !== undefined) updateData.isActive = active;

      const response = await fetch(`http://localhost:5000/api/memory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update memory: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const updatedMemoryBlock = await response.json();

      // Emit memory changed event
      await emitMemoryChanged(deviceId, 'updated', updatedMemoryBlock);

      return {
        memory_block: updatedMemoryBlock,
        message: 'Memory block updated successfully'
      };
    } catch (error) {
      console.error('Memory update error:', error);
      throw new Error(`Memory update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete memory block
   */
  static async deleteMemory(deviceId: string, payload: MemoryDeletePayload): Promise<any> {
    try {
      const { id } = payload;

      // Get the memory block before deletion for the event
      const getResponse = await fetch(`http://localhost:5000/api/memory/${deviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let memoryBlock = null;
      if (getResponse.ok) {
        const memoryBlocks = await getResponse.json();
        memoryBlock = memoryBlocks.find((block: any) => block.id === id);
      }

      const response = await fetch(`http://localhost:5000/api/memory/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to delete memory: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      // Emit memory changed event
      if (memoryBlock) {
        await emitMemoryChanged(deviceId, 'deleted', memoryBlock);
      }

      return {
        message: 'Memory block deleted successfully',
        deleted_id: id
      };
    } catch (error) {
      console.error('Memory delete error:', error);
      throw new Error(`Memory deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get memory statistics
   */
  static async getMemoryStats(deviceId: string): Promise<any> {
    try {
      const response = await fetch(`http://localhost:5000/api/memory/${deviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get memory stats: ${response.status}`);
      }

      const memoryBlocks = await response.json();
      
      const stats = {
        total_blocks: memoryBlocks.length,
        active_blocks: memoryBlocks.filter((block: any) => block.isActive).length,
        inactive_blocks: memoryBlocks.filter((block: any) => !block.isActive).length,
        categories: this.getCategoryStats(memoryBlocks),
        importance_distribution: this.getImportanceDistribution(memoryBlocks),
        average_importance: this.getAverageImportance(memoryBlocks)
      };

      return stats;
    } catch (error) {
      console.error('Memory stats error:', error);
      throw new Error(`Failed to get memory statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a title from content
   */
  private static generateTitle(content: string): string {
    // Take first 50 characters and clean up
    let title = content.substring(0, 50).trim();
    
    // Remove newlines and extra spaces
    title = title.replace(/\s+/g, ' ');
    
    // Add ellipsis if truncated
    if (content.length > 50) {
      title += '...';
    }
    
    return title || 'Memory Block';
  }

  /**
   * Get category statistics
   */
  private static getCategoryStats(memoryBlocks: any[]): Record<string, number> {
    const categories: Record<string, number> = {};
    
    for (const block of memoryBlocks) {
      const category = block.category || 'uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    }
    
    return categories;
  }

  /**
   * Get importance distribution
   */
  private static getImportanceDistribution(memoryBlocks: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (let i = 1; i <= 10; i++) {
      distribution[i.toString()] = 0;
    }
    
    for (const block of memoryBlocks) {
      const importance = block.importance || 5;
      distribution[importance.toString()]++;
    }
    
    return distribution;
  }

  /**
   * Get average importance
   */
  private static getAverageImportance(memoryBlocks: any[]): number {
    if (memoryBlocks.length === 0) return 0;
    
    const total = memoryBlocks.reduce((sum, block) => sum + (block.importance || 5), 0);
    return Math.round((total / memoryBlocks.length) * 100) / 100;
  }
}
