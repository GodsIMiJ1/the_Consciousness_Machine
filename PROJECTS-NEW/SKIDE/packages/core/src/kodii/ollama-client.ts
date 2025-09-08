/**
 * Ollama Client - Local AI Integration for SKIDE
 * Provides sovereign AI capabilities through local Ollama instance
 */

export interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaGenerateRequest {
  model: string
  prompt: string
  system?: string
  template?: string
  context?: number[]
  stream?: boolean
  raw?: boolean
  format?: string
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
    repeat_penalty?: number
    seed?: number
    num_ctx?: number
    num_predict?: number
  }
}

export class OllamaClient {
  private baseUrl: string
  private defaultModel: string
  private fallbackModel: string

  constructor(
    baseUrl: string = 'http://localhost:11434',
    defaultModel: string = 'codellama:7b',
    fallbackModel: string = 'codellama:13b-instruct'
  ) {
    this.baseUrl = baseUrl
    this.defaultModel = defaultModel
    this.fallbackModel = fallbackModel
  }

  /**
   * Check if Ollama service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      return response.ok
    } catch (error) {
      console.error('Ollama health check failed:', error)
      return false
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.models?.map((model: any) => model.name) || []
    } catch (error) {
      console.error('Failed to list Ollama models:', error)
      return []
    }
  }

  /**
   * Generate text completion using Ollama
   */
  async generate(request: Partial<OllamaGenerateRequest>): Promise<OllamaResponse> {
    const fullRequest: OllamaGenerateRequest = {
      model: this.defaultModel,
      stream: false,
      ...request
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullRequest)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Ollama generation failed:', error)
      
      // Try fallback model if default fails
      if (fullRequest.model === this.defaultModel) {
        console.log(`Retrying with fallback model: ${this.fallbackModel}`)
        return this.generate({
          ...request,
          model: this.fallbackModel
        })
      }
      
      throw error
    }
  }

  /**
   * Generate streaming response
   */
  async generateStream(
    request: Partial<OllamaGenerateRequest>,
    onChunk: (chunk: OllamaResponse) => void
  ): Promise<void> {
    const fullRequest: OllamaGenerateRequest = {
      model: this.defaultModel,
      stream: true,
      ...request
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullRequest)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader available')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim()) {
            try {
              const chunk = JSON.parse(line)
              onChunk(chunk)
              
              if (chunk.done) {
                return
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming chunk:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Ollama streaming failed:', error)
      throw error
    }
  }

  /**
   * Kodii-specific prompt templates
   */
  async generatePRD(projectContext: any): Promise<string> {
    const systemPrompt = `You are Kodii, the sovereign AI architect for SKIDE. 
Generate a comprehensive Product Requirements Document based on the provided project context.
Focus on technical requirements, architecture decisions, and implementation strategy.
Be specific and actionable.`

    const userPrompt = `Analyze this project context and generate a PRD:

Project Context:
${JSON.stringify(projectContext, null, 2)}

Generate a detailed PRD with:
1. Problem Statement
2. Technical Requirements  
3. Architecture Overview
4. Implementation Plan
5. Success Metrics
6. Risk Assessment`

    const response = await this.generate({
      model: this.defaultModel,
      system: systemPrompt,
      prompt: userPrompt,
      options: {
        temperature: 0.1,
        num_ctx: 4096,
        num_predict: 2048
      }
    })

    return response.response
  }

  /**
   * Generate task breakdown from PRD
   */
  async generateTaskGraph(prdContent: string): Promise<string> {
    const systemPrompt = `You are Kodii, the sovereign AI architect for SKIDE.
Break down the PRD into a detailed task dependency graph.
Create specific, actionable tasks with time estimates and dependencies.
Use markdown format with checkboxes.`

    const userPrompt = `Break down this PRD into implementation tasks:

${prdContent}

Generate:
1. Task hierarchy with dependencies
2. Time estimates for each task
3. Critical path analysis
4. Risk mitigation tasks
5. Testing and documentation tasks`

    const response = await this.generate({
      model: this.defaultModel,
      system: systemPrompt,
      prompt: userPrompt,
      options: {
        temperature: 0.1,
        num_ctx: 4096,
        num_predict: 1024
      }
    })

    return response.response
  }

  /**
   * Generate code scaffold from feature specification
   */
  async generateScaffold(featureSpec: string, projectContext?: any): Promise<string> {
    const systemPrompt = `You are Kodii, the sovereign AI architect for SKIDE.
Generate a complete code scaffold for the specified feature.
Include directory structure, boilerplate code, and implementation guidelines.
Follow TypeScript and React best practices.`

    const contextInfo = projectContext ? `\n\nProject Context:\n${JSON.stringify(projectContext, null, 2)}` : ''

    const userPrompt = `Generate a code scaffold for this feature:

${featureSpec}${contextInfo}

Include:
1. Directory structure
2. TypeScript interfaces and types
3. React component boilerplate
4. Service layer structure
5. Test file templates
6. Implementation guidelines`

    const response = await this.generate({
      model: this.defaultModel,
      system: systemPrompt,
      prompt: userPrompt,
      options: {
        temperature: 0.2,
        num_ctx: 4096,
        num_predict: 2048
      }
    })

    return response.response
  }
}
