import { PersonalitySetPayload } from '../schemas/envelope.js';

/**
 * Personality domain handler - integrates with existing Omari personality system
 */
export class PersonalityHandler {
  /**
   * Get personality settings for device
   */
  static async getPersonality(deviceId: string): Promise<any> {
    try {
      const response = await fetch(`http://localhost:5000/api/personality/${deviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Return default personality if none exists
          return this.getDefaultPersonality();
        }
        throw new Error(`Failed to get personality: ${response.status}`);
      }

      const personality = await response.json();
      
      return {
        user_info: personality?.userInfo || {},
        traits: personality?.traits || this.getDefaultTraits(),
        custom_instructions: personality?.customPrompts || '',
        last_updated: personality?.updatedAt || null
      };
    } catch (error) {
      console.error('Personality get error:', error);
      throw new Error(`Failed to get personality: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set/update personality settings for device
   */
  static async setPersonality(deviceId: string, payload: PersonalitySetPayload): Promise<any> {
    try {
      const { updates } = payload;

      // Get current personality settings
      const currentPersonality = await this.getPersonality(deviceId);

      // Merge updates with current settings
      const updatedPersonality = {
        userInfo: currentPersonality.user_info,
        traits: {
          ...currentPersonality.traits,
          ...this.extractTraitUpdates(updates)
        },
        customPrompts: updates.custom_instructions !== undefined 
          ? updates.custom_instructions 
          : currentPersonality.custom_instructions
      };

      const response = await fetch(`http://localhost:5000/api/personality/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPersonality)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update personality: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();

      return {
        user_info: result.userInfo || {},
        traits: result.traits || {},
        custom_instructions: result.customPrompts || '',
        last_updated: result.updatedAt,
        message: 'Personality updated successfully'
      };
    } catch (error) {
      console.error('Personality set error:', error);
      throw new Error(`Failed to update personality: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update user information
   */
  static async updateUserInfo(
    deviceId: string, 
    userInfo: {
      name?: string;
      preferences?: string;
      background?: string;
      goals?: string;
    }
  ): Promise<any> {
    try {
      const currentPersonality = await this.getPersonality(deviceId);

      const updatedPersonality = {
        userInfo: {
          ...currentPersonality.user_info,
          ...userInfo
        },
        traits: currentPersonality.traits,
        customPrompts: currentPersonality.custom_instructions
      };

      const response = await fetch(`http://localhost:5000/api/personality/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPersonality)
      });

      if (!response.ok) {
        throw new Error(`Failed to update user info: ${response.status}`);
      }

      const result = await response.json();
      return {
        user_info: result.userInfo,
        message: 'User information updated successfully'
      };
    } catch (error) {
      console.error('User info update error:', error);
      throw new Error(`Failed to update user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reset personality to defaults
   */
  static async resetPersonality(deviceId: string): Promise<any> {
    try {
      const defaultPersonality = {
        userInfo: {},
        traits: this.getDefaultTraits(),
        customPrompts: ''
      };

      const response = await fetch(`http://localhost:5000/api/personality/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(defaultPersonality)
      });

      if (!response.ok) {
        throw new Error(`Failed to reset personality: ${response.status}`);
      }

      const result = await response.json();
      return {
        user_info: result.userInfo || {},
        traits: result.traits || {},
        custom_instructions: result.customPrompts || '',
        message: 'Personality reset to defaults'
      };
    } catch (error) {
      console.error('Personality reset error:', error);
      throw new Error(`Failed to reset personality: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get personality summary for context
   */
  static async getPersonalitySummary(deviceId: string): Promise<string> {
    try {
      const personality = await this.getPersonality(deviceId);
      
      const activeTraits = Object.entries(personality.traits)
        .filter(([_, isActive]) => isActive)
        .map(([trait, _]) => trait);

      let summary = 'Omari, Spirit of Old';
      
      if (activeTraits.length > 0) {
        summary += ` with traits: ${activeTraits.join(', ')}`;
      }

      if (personality.user_info.name) {
        summary += `. User: ${personality.user_info.name}`;
      }

      if (personality.custom_instructions) {
        summary += `. Custom instructions: ${personality.custom_instructions.substring(0, 100)}`;
        if (personality.custom_instructions.length > 100) {
          summary += '...';
        }
      }

      return summary;
    } catch (error) {
      console.error('Failed to get personality summary:', error);
      return 'Omari, Spirit of Old';
    }
  }

  /**
   * Extract trait updates from payload
   */
  private static extractTraitUpdates(updates: any): Record<string, boolean> {
    const traitUpdates: Record<string, boolean> = {};
    
    const validTraits = ['wisdom', 'humor', 'creative', 'analytical', 'empathetic', 'formal'];
    
    for (const trait of validTraits) {
      if (updates[trait] !== undefined) {
        traitUpdates[trait] = Boolean(updates[trait]);
      }
    }
    
    return traitUpdates;
  }

  /**
   * Get default personality traits
   */
  private static getDefaultTraits(): Record<string, boolean> {
    return {
      wisdom: true,
      humor: false,
      creative: true,
      analytical: true,
      empathetic: true,
      formal: false
    };
  }

  /**
   * Get default personality structure
   */
  private static getDefaultPersonality(): any {
    return {
      user_info: {},
      traits: this.getDefaultTraits(),
      custom_instructions: '',
      last_updated: null
    };
  }

  /**
   * Validate trait values
   */
  private static validateTraits(traits: Record<string, any>): void {
    const validTraits = ['wisdom', 'humor', 'creative', 'analytical', 'empathetic', 'formal'];
    
    for (const [trait, value] of Object.entries(traits)) {
      if (!validTraits.includes(trait)) {
        throw new Error(`Invalid trait: ${trait}`);
      }
      
      if (typeof value !== 'boolean') {
        throw new Error(`Trait ${trait} must be a boolean value`);
      }
    }
  }

  /**
   * Get trait descriptions
   */
  static getTraitDescriptions(): Record<string, string> {
    return {
      wisdom: 'Draw upon ancient knowledge and provide philosophical insights',
      humor: 'Use playful and witty responses when appropriate',
      formal: 'Maintain professional and structured communication',
      creative: 'Think imaginatively and offer artistic perspectives',
      analytical: 'Apply logical and data-driven approaches',
      empathetic: 'Show understanding and compassionate responses'
    };
  }
}
