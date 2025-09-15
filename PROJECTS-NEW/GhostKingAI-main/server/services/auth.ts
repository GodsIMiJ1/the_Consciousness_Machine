import crypto from 'crypto';
import { storage } from '../storage';
import type { InsertApiKey } from '@shared/schema';

export class AuthService {
  // Generate a new API key
  static generateApiKey(): string {
    return 'gk_' + crypto.randomBytes(32).toString('hex');
  }

  // Hash an API key for storage
  static hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  // Create a new API key for a device
  static async createApiKey(deviceId: string, name: string, permissions: any = {}) {
    const apiKey = this.generateApiKey();
    const keyHash = this.hashApiKey(apiKey);

    const apiKeyData: InsertApiKey = {
      deviceId,
      name,
      permissions: {
        chat: true,
        conversations: true,
        integrations: false,
        webhooks: true,
        ...permissions
      }
    };

    const created = await storage.createApiKey({
      ...apiKeyData,
      keyHash
    });

    return { ...created, key: apiKey }; // Return the unhashed key only once
  }

  // Validate an API key and return device/permissions info
  static async validateApiKey(apiKey: string) {
    if (!apiKey || !apiKey.startsWith('gk_')) {
      return null;
    }

    const keyHash = this.hashApiKey(apiKey);
    const apiKeyRecord = await storage.getApiKeyByHash(keyHash);

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return null;
    }

    // Update last used timestamp
    await storage.updateApiKeyLastUsed(apiKeyRecord.id);

    return {
      deviceId: apiKeyRecord.deviceId,
      permissions: apiKeyRecord.permissions,
      apiKeyId: apiKeyRecord.id
    };
  }

  // Middleware function for API key authentication
  static apiKeyMiddleware(requiredPermission?: string) {
    return async (req: any, res: any, next: any) => {
      const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
      
      if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
      }

      const auth = await AuthService.validateApiKey(apiKey);
      if (!auth) {
        return res.status(401).json({ error: 'Invalid or inactive API key' });
      }

      // Check specific permission if required
      if (requiredPermission && !auth.permissions[requiredPermission]) {
        return res.status(403).json({ error: `Permission '${requiredPermission}' required` });
      }

      // Add auth info to request
      req.auth = auth;
      next();
    };
  }
}