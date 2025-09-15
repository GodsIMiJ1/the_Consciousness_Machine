export interface NetlifyConfig {
  accessToken: string;
  siteId?: string;
}

export class NetlifyIntegration {
  private config: NetlifyConfig;
  private baseUrl = 'https://api.netlify.com/api/v1';

  constructor(config: NetlifyConfig) {
    this.config = config;
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Netlify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getSites() {
    const sites = await this.apiRequest('/sites');
    return sites.map((site: any) => ({
      id: site.id,
      name: site.name,
      url: site.url,
      adminUrl: site.admin_url,
      buildHook: site.build_hook_url,
      state: site.state,
      updatedAt: site.updated_at,
      deployUrl: site.deploy_url,
      branch: site.build_settings?.repo_branch
    }));
  }

  async getSiteDetails(siteId?: string) {
    const id = siteId || this.config.siteId;
    if (!id) throw new Error('No site ID provided');
    
    return await this.apiRequest(`/sites/${id}`);
  }

  async getDeployments(siteId?: string, limit = 10) {
    const id = siteId || this.config.siteId;
    if (!id) throw new Error('No site ID provided');

    const deployments = await this.apiRequest(`/sites/${id}/deploys?per_page=${limit}`);
    return deployments.map((deploy: any) => ({
      id: deploy.id,
      state: deploy.state,
      name: deploy.name,
      url: deploy.deploy_url,
      branch: deploy.branch,
      commitRef: deploy.commit_ref,
      commitUrl: deploy.commit_url,
      createdAt: deploy.created_at,
      updatedAt: deploy.updated_at,
      buildId: deploy.build_id,
      errorMessage: deploy.error_message
    }));
  }

  async triggerDeploy(siteId?: string) {
    const id = siteId || this.config.siteId;
    if (!id) throw new Error('No site ID provided');

    return await this.apiRequest(`/sites/${id}/builds`, {
      method: 'POST'
    });
  }

  async getDomains(siteId?: string) {
    const id = siteId || this.config.siteId;
    if (!id) throw new Error('No site ID provided');

    const site = await this.getSiteDetails(id);
    return {
      customDomain: site.custom_domain,
      domains: site.domain_aliases || [],
      defaultDomain: site.default_domain
    };
  }

  async getBuildHooks(siteId?: string) {
    const id = siteId || this.config.siteId;
    if (!id) throw new Error('No site ID provided');

    return await this.apiRequest(`/sites/${id}/build_hooks`);
  }

  async getForms(siteId?: string) {
    const id = siteId || this.config.siteId;
    if (!id) throw new Error('No site ID provided');

    const forms = await this.apiRequest(`/sites/${id}/forms`);
    return forms.map((form: any) => ({
      id: form.id,
      name: form.name,
      submissionCount: form.submission_count,
      fields: form.fields,
      createdAt: form.created_at
    }));
  }

  async testConnection() {
    try {
      await this.apiRequest('/user');
      return { success: true, message: 'Netlify connection successful' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Connection failed' };
    }
  }
}