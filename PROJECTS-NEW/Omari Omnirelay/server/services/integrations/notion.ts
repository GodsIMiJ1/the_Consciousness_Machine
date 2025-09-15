export interface NotionConfig {
  token: string;
  databaseId?: string;
  pageId?: string;
}

export class NotionIntegration {
  private config: NotionConfig;
  private baseUrl = 'https://api.notion.com/v1';

  constructor(config: NotionConfig) {
    this.config = config;
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getDatabases() {
    const response = await this.apiRequest('/search', {
      method: 'POST',
      body: JSON.stringify({
        filter: { property: 'object', value: 'database' },
        page_size: 20
      })
    });

    return response.results.map((db: any) => ({
      id: db.id,
      title: db.title[0]?.plain_text || 'Untitled',
      url: db.url,
      lastEditedTime: db.last_edited_time,
      properties: Object.keys(db.properties)
    }));
  }

  async getPages(databaseId?: string) {
    const dbId = databaseId || this.config.databaseId;
    if (!dbId) throw new Error('No database ID provided');

    const response = await this.apiRequest(`/databases/${dbId}/query`, {
      method: 'POST',
      body: JSON.stringify({ page_size: 20 })
    });

    return response.results.map((page: any) => ({
      id: page.id,
      title: this.extractTitle(page.properties),
      url: page.url,
      lastEditedTime: page.last_edited_time,
      properties: this.extractProperties(page.properties)
    }));
  }

  async createPage(databaseId: string, properties: any, content?: any[]) {
    return await this.apiRequest('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
        children: content || []
      })
    });
  }

  async updatePage(pageId: string, properties: any) {
    return await this.apiRequest(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties })
    });
  }

  async searchPages(query: string) {
    const response = await this.apiRequest('/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        filter: { property: 'object', value: 'page' },
        page_size: 10
      })
    });

    return response.results.map((page: any) => ({
      id: page.id,
      title: this.extractTitle(page.properties) || page.url.split('/').pop(),
      url: page.url,
      lastEditedTime: page.last_edited_time
    }));
  }

  private extractTitle(properties: any): string {
    const titleProp = Object.values(properties).find((prop: any) => prop.type === 'title') as any;
    return titleProp?.title?.[0]?.plain_text || '';
  }

  private extractProperties(properties: any): any {
    const result: any = {};
    for (const [key, prop] of Object.entries(properties) as [string, any][]) {
      switch (prop.type) {
        case 'title':
          result[key] = prop.title?.[0]?.plain_text || '';
          break;
        case 'rich_text':
          result[key] = prop.rich_text?.[0]?.plain_text || '';
          break;
        case 'number':
          result[key] = prop.number;
          break;
        case 'select':
          result[key] = prop.select?.name;
          break;
        case 'checkbox':
          result[key] = prop.checkbox;
          break;
        case 'date':
          result[key] = prop.date?.start;
          break;
        default:
          result[key] = prop;
      }
    }
    return result;
  }

  async testConnection() {
    try {
      await this.apiRequest('/users/me');
      return { success: true, message: 'Notion connection successful' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Connection failed' };
    }
  }
}