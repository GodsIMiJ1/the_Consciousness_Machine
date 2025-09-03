import { IntegrationInvokePayload } from '../schemas/envelope.js';
import { emitIntegrationExecuted } from '../handlers/emit.js';

/**
 * Integration domain handler - integrates with existing Omari integration system
 */
export class IntegrationHandler {
  /**
   * Invoke integration operation
   */
  static async invokeIntegration(deviceId: string, payload: IntegrationInvokePayload): Promise<any> {
    try {
      const { provider, action, params } = payload;

      // Validate provider
      const validProviders = ['github', 'notion', 'gmail', 'netlify', 'gdocs', 'vscode', 'custom'];
      if (!validProviders.includes(provider)) {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      // Get device integrations to find the right one
      const integrations = await this.getDeviceIntegrations(deviceId);
      const integration = integrations.find((int: any) => 
        int.type === provider && int.isActive
      );

      if (!integration) {
        throw new Error(`No active ${provider} integration found for device`);
      }

      // Route to specific provider handler
      let result;
      switch (provider) {
        case 'github':
          result = await this.invokeGitHubIntegration(integration, action, params);
          break;
        case 'notion':
          result = await this.invokeNotionIntegration(integration, action, params);
          break;
        case 'gmail':
          result = await this.invokeGmailIntegration(integration, action, params);
          break;
        case 'netlify':
          result = await this.invokeNetlifyIntegration(integration, action, params);
          break;
        case 'gdocs':
          result = await this.invokeGoogleDocsIntegration(integration, action, params);
          break;
        case 'vscode':
          result = await this.invokeVSCodeIntegration(integration, action, params);
          break;
        case 'custom':
          result = await this.invokeCustomIntegration(integration, action, params);
          break;
        default:
          throw new Error(`Provider ${provider} not implemented`);
      }

      // Emit integration executed event
      await emitIntegrationExecuted(deviceId, provider, action, result);

      return {
        provider,
        action,
        result,
        integration_id: integration.id,
        executed_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Integration invoke error:', error);
      throw new Error(`Integration invocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get device integrations
   */
  private static async getDeviceIntegrations(deviceId: string): Promise<any[]> {
    try {
      const response = await fetch(`http://localhost:5000/api/integrations/${deviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get integrations: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get device integrations:', error);
      return [];
    }
  }

  /**
   * Invoke GitHub integration
   */
  private static async invokeGitHubIntegration(integration: any, action: string, params: any): Promise<any> {
    const validActions = ['repositories', 'issues', 'pullRequests', 'profile'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid GitHub action: ${action}`);
    }

    const operationParams = {
      operation: `github.${action}`,
      params
    };

    return await this.executeIntegrationOperation(integration.id, operationParams);
  }

  /**
   * Invoke Notion integration
   */
  private static async invokeNotionIntegration(integration: any, action: string, params: any): Promise<any> {
    const validActions = ['databases', 'pages', 'search', 'create', 'update'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid Notion action: ${action}`);
    }

    const operationParams = {
      operation: `notion.${action}`,
      params
    };

    return await this.executeIntegrationOperation(integration.id, operationParams);
  }

  /**
   * Invoke Gmail integration
   */
  private static async invokeGmailIntegration(integration: any, action: string, params: any): Promise<any> {
    const validActions = ['messages', 'send', 'search', 'markRead'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid Gmail action: ${action}`);
    }

    const operationParams = {
      operation: `gmail.${action}`,
      params
    };

    return await this.executeIntegrationOperation(integration.id, operationParams);
  }

  /**
   * Invoke Netlify integration
   */
  private static async invokeNetlifyIntegration(integration: any, action: string, params: any): Promise<any> {
    const validActions = ['sites', 'deployments', 'domains', 'forms', 'buildHooks'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid Netlify action: ${action}`);
    }

    const operationParams = {
      operation: `netlify.${action}`,
      params
    };

    return await this.executeIntegrationOperation(integration.id, operationParams);
  }

  /**
   * Invoke Google Docs integration
   */
  private static async invokeGoogleDocsIntegration(integration: any, action: string, params: any): Promise<any> {
    const validActions = ['documents', 'create', 'edit', 'share'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid Google Docs action: ${action}`);
    }

    // Google Docs integration would be implemented here
    throw new Error('Google Docs integration not yet implemented');
  }

  /**
   * Invoke VS Code integration
   */
  private static async invokeVSCodeIntegration(integration: any, action: string, params: any): Promise<any> {
    const validActions = ['workspace', 'files', 'extensions', 'settings'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid VS Code action: ${action}`);
    }

    // VS Code integration would be implemented here
    throw new Error('VS Code integration not yet implemented');
  }

  /**
   * Invoke custom integration
   */
  private static async invokeCustomIntegration(integration: any, action: string, params: any): Promise<any> {
    // Custom integration logic would be implemented here
    // This would likely involve making HTTP requests to the custom API endpoint
    const { apiEndpoint, apiKey, authType } = integration.settings || {};

    if (!apiEndpoint) {
      throw new Error('Custom integration missing API endpoint');
    }

    // Build request headers based on auth type
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (authType === 'api-key' && apiKey) {
      headers['X-API-Key'] = apiKey;
    } else if (authType === 'bearer-token' && apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    try {
      const response = await fetch(`${apiEndpoint}/${action}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Custom API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Custom integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute integration operation via existing Omari API
   */
  private static async executeIntegrationOperation(integrationId: string, operationParams: any): Promise<any> {
    try {
      const response = await fetch(`http://localhost:5000/api/integrations/${integrationId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(operationParams)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Integration operation failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Integration operation error:', error);
      throw error;
    }
  }

  /**
   * Test integration connection
   */
  static async testIntegration(deviceId: string, provider: string): Promise<any> {
    try {
      const integrations = await this.getDeviceIntegrations(deviceId);
      const integration = integrations.find((int: any) => 
        int.type === provider && int.isActive
      );

      if (!integration) {
        throw new Error(`No active ${provider} integration found`);
      }

      const response = await fetch('http://localhost:5000/api/integrations/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: provider,
          config: integration.settings
        })
      });

      if (!response.ok) {
        throw new Error(`Integration test failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Integration test error:', error);
      throw new Error(`Integration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List available integration templates
   */
  static async getIntegrationTemplates(): Promise<any> {
    try {
      const response = await fetch('http://localhost:5000/api/integrations/templates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get integration templates: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get integration templates:', error);
      return [];
    }
  }
}
