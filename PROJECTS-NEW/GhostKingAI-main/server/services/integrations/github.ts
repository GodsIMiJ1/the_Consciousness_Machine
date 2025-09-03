export interface GitHubConfig {
  token: string;
  username?: string;
  repositories?: string[];
}

export class GitHubIntegration {
  private config: GitHubConfig;
  private baseUrl = 'https://api.github.com';

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getRepositories() {
    const repos = await this.apiRequest('/user/repos?sort=updated&per_page=20');
    return repos.map((repo: any) => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      updatedAt: repo.updated_at,
      stars: repo.stargazers_count,
      isPrivate: repo.private
    }));
  }

  async getIssues(repo: string) {
    const issues = await this.apiRequest(`/repos/${repo}/issues?state=open&per_page=10`);
    return issues.map((issue: any) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      url: issue.html_url,
      createdAt: issue.created_at,
      author: issue.user.login
    }));
  }

  async getPullRequests(repo: string) {
    const prs = await this.apiRequest(`/repos/${repo}/pulls?state=open&per_page=10`);
    return prs.map((pr: any) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body,
      state: pr.state,
      url: pr.html_url,
      createdAt: pr.created_at,
      author: pr.user.login,
      mergeable: pr.mergeable
    }));
  }

  async createIssue(repo: string, title: string, body: string, labels?: string[]) {
    return await this.apiRequest(`/repos/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title, body, labels })
    });
  }

  async getProfile() {
    return await this.apiRequest('/user');
  }

  async testConnection() {
    try {
      await this.getProfile();
      return { success: true, message: 'GitHub connection successful' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Connection failed' };
    }
  }
}