import { GitHubIntegration, type GitHubConfig } from './github';
import { NotionIntegration, type NotionConfig } from './notion';
import { GmailIntegration, type GmailConfig } from './gmail';
import { NetlifyIntegration, type NetlifyConfig } from './netlify';

export interface IntegrationTemplate {
  type: string;
  name: string;
  description: string;
  icon: string;
  configFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'select';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
  capabilities: string[];
}

export const INTEGRATION_TEMPLATES: IntegrationTemplate[] = [
  {
    type: 'github',
    name: 'GitHub',
    description: 'Manage repositories, issues, and pull requests',
    icon: 'github',
    configFields: [
      {
        key: 'token',
        label: 'Personal Access Token',
        type: 'password',
        required: true,
        placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx'
      },
      {
        key: 'username',
        label: 'Username (optional)',
        type: 'text',
        required: false,
        placeholder: 'your-github-username'
      }
    ],
    capabilities: ['repositories', 'issues', 'pull_requests', 'profile']
  },
  {
    type: 'notion',
    name: 'Notion',
    description: 'Read and write pages and databases',
    icon: 'notion',
    configFields: [
      {
        key: 'token',
        label: 'Integration Token',
        type: 'password',
        required: true,
        placeholder: 'secret_xxxxxxxxxxxxxxxxxxxxxxxx'
      },
      {
        key: 'databaseId',
        label: 'Default Database ID (optional)',
        type: 'text',
        required: false,
        placeholder: '32-character database ID'
      }
    ],
    capabilities: ['databases', 'pages', 'search', 'create', 'update']
  },
  {
    type: 'gmail',
    name: 'Gmail',
    description: 'Read emails, send messages, and manage inbox',
    icon: 'mail',
    configFields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        required: true,
        placeholder: 'OAuth2 access token'
      },
      {
        key: 'refreshToken',
        label: 'Refresh Token (optional)',
        type: 'password',
        required: false,
        placeholder: 'OAuth2 refresh token'
      }
    ],
    capabilities: ['read_emails', 'send_emails', 'search', 'mark_read']
  },
  {
    type: 'netlify',
    name: 'Netlify',
    description: 'Manage deployments and site configuration',
    icon: 'netlify',
    configFields: [
      {
        key: 'accessToken',
        label: 'Personal Access Token',
        type: 'password',
        required: true,
        placeholder: 'Netlify access token'
      },
      {
        key: 'siteId',
        label: 'Default Site ID (optional)',
        type: 'text',
        required: false,
        placeholder: 'Site ID for default operations'
      }
    ],
    capabilities: ['sites', 'deployments', 'domains', 'forms', 'build_hooks']
  },
  {
    type: 'google-docs',
    name: 'Google Docs',
    description: 'Read and edit Google Documents',
    icon: 'file-text',
    configFields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        required: true,
        placeholder: 'OAuth2 access token'
      }
    ],
    capabilities: ['read_documents', 'edit_documents', 'create_documents']
  },
  {
    type: 'vscode',
    name: 'VS Code',
    description: 'Access workspace and file information',
    icon: 'code',
    configFields: [
      {
        key: 'apiEndpoint',
        label: 'VS Code Server URL',
        type: 'url',
        required: true,
        placeholder: 'http://localhost:3000/api'
      },
      {
        key: 'apiKey',
        label: 'API Key (optional)',
        type: 'password',
        required: false,
        placeholder: 'Custom API key if required'
      }
    ],
    capabilities: ['workspace', 'files', 'extensions', 'settings']
  },
  {
    type: 'chatgpt',
    name: 'ChatGPT API',
    description: 'Access OpenAI ChatGPT models',
    icon: 'message-circle',
    configFields: [
      {
        key: 'apiKey',
        label: 'OpenAI API Key',
        type: 'password',
        required: true,
        placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx'
      },
      {
        key: 'model',
        label: 'Model',
        type: 'select',
        required: true,
        options: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo']
      }
    ],
    capabilities: ['chat', 'completions', 'embeddings']
  },
  {
    type: 'custom-api',
    name: 'Custom API',
    description: 'Connect to your own APIs',
    icon: 'server',
    configFields: [
      {
        key: 'name',
        label: 'API Name',
        type: 'text',
        required: true,
        placeholder: 'My Custom API'
      },
      {
        key: 'apiEndpoint',
        label: 'Base URL',
        type: 'url',
        required: true,
        placeholder: 'https://api.example.com'
      },
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: false,
        placeholder: 'Authentication key'
      },
      {
        key: 'authType',
        label: 'Authentication Type',
        type: 'select',
        required: true,
        options: ['none', 'api-key', 'bearer-token', 'basic-auth']
      }
    ],
    capabilities: ['custom_endpoints', 'webhooks']
  }
];

export class IntegrationManager {
  static createIntegration(type: string, config: any) {
    switch (type) {
      case 'github':
        return new GitHubIntegration(config as GitHubConfig);
      case 'notion':
        return new NotionIntegration(config as NotionConfig);
      case 'gmail':
        return new GmailIntegration(config as GmailConfig);
      case 'netlify':
        return new NetlifyIntegration(config as NetlifyConfig);
      default:
        throw new Error(`Integration type '${type}' not supported`);
    }
  }

  static async testIntegration(type: string, config: any) {
    try {
      const integration = this.createIntegration(type, config);
      return await integration.testConnection();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Integration test failed' 
      };
    }
  }

  static getTemplate(type: string): IntegrationTemplate | undefined {
    return INTEGRATION_TEMPLATES.find(template => template.type === type);
  }

  static getAllTemplates(): IntegrationTemplate[] {
    return INTEGRATION_TEMPLATES;
  }
}

export * from './github';
export * from './notion';
export * from './gmail';
export * from './netlify';