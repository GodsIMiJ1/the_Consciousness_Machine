import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const STORAGE_DIR = '/tmp/tickets';
const KB_INDEX_PATH = '/tmp/kb-index.json';

interface Ticket {
  id: string;
  summary: string;
  urgent: boolean;
  createdAt: string;
}

interface KBDocument {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  filePath?: string;
}

interface KBIndex {
  docs: KBDocument[];
  generatedAt: string;
  totalDocs: number;
}

interface SearchHit {
  id: string;
  title: string;
  excerpt: string;
  updatedAt: string;
  score: number;
  filePath?: string;
}

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await Deno.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
}

// Generate unique ID
function generateId(): string {
  return crypto.randomUUID();
}

// Get all tickets
async function getTickets(): Promise<Ticket[]> {
  await ensureStorageDir();
  
  const tickets: Ticket[] = [];
  
  try {
    for await (const dirEntry of Deno.readDir(STORAGE_DIR)) {
      if (dirEntry.isFile && dirEntry.name.endsWith('.json')) {
        const filePath = `${STORAGE_DIR}/${dirEntry.name}`;
        const content = await Deno.readTextFile(filePath);
        const ticket = JSON.parse(content) as Ticket;
        tickets.push(ticket);
      }
    }
  } catch (error) {
    console.error('Error reading tickets:', error);
  }
  
  // Sort by createdAt descending (newest first)
  return tickets.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Create a new ticket
async function createTicket(summary: string, urgent: boolean = false): Promise<Ticket> {
  await ensureStorageDir();
  
  const ticket: Ticket = {
    id: generateId(),
    summary,
    urgent,
    createdAt: new Date().toISOString(),
  };
  
  const filePath = `${STORAGE_DIR}/${ticket.id}.json`;
  await Deno.writeTextFile(filePath, JSON.stringify(ticket, null, 2));
  
  // Handle urgent escalation webhook
  if (urgent) {
    await handleUrgentEscalation(ticket);
  }
  
  return ticket;
}

// TF-IDF Search Implementation
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

function calculateTfIdf(query: string, doc: KBDocument, allDocs: KBDocument[]): number {
  const queryTerms = tokenize(query);
  const docTerms = tokenize(doc.content + ' ' + doc.title);
  
  if (queryTerms.length === 0 || docTerms.length === 0) return 0;
  
  let score = 0;
  const docLength = docTerms.length;
  const totalDocs = allDocs.length;
  
  for (const term of queryTerms) {
    // Term frequency in document
    const tf = docTerms.filter(t => t === term).length / docLength;
    
    if (tf === 0) continue;
    
    // Document frequency
    const df = allDocs.filter(d => 
      tokenize(d.content + ' ' + d.title).includes(term)
    ).length;
    
    // Inverse document frequency
    const idf = Math.log(totalDocs / (df + 1));
    
    // TF-IDF score
    score += tf * idf;
  }
  
  // Boost for title matches
  const titleTerms = tokenize(doc.title);
  const titleMatches = queryTerms.filter(term => titleTerms.includes(term)).length;
  if (titleMatches > 0) {
    score *= 1.5; // 50% boost for title matches
  }
  
  return score;
}

function generateExcerpt(content: string, query: string, maxLength: number = 200): string {
  const queryTerms = tokenize(query);
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  // Find sentence with most query term matches
  let bestSentence = sentences[0] || '';
  let maxMatches = 0;
  
  for (const sentence of sentences) {
    const sentenceTerms = tokenize(sentence);
    const matches = queryTerms.filter(term => sentenceTerms.includes(term)).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestSentence = sentence;
    }
  }
  
  if (bestSentence.length <= maxLength) {
    return bestSentence;
  }
  
  // Truncate around query terms
  for (const term of queryTerms) {
    const index = bestSentence.toLowerCase().indexOf(term);
    if (index !== -1) {
      const start = Math.max(0, index - maxLength / 3);
      const end = Math.min(bestSentence.length, start + maxLength);
      let excerpt = bestSentence.slice(start, end);
      
      if (start > 0) excerpt = '...' + excerpt;
      if (end < bestSentence.length) excerpt = excerpt + '...';
      
      return excerpt;
    }
  }
  
  return bestSentence.slice(0, maxLength) + (bestSentence.length > maxLength ? '...' : '');
}

async function loadKBIndex(): Promise<KBIndex | null> {
  try {
    const content = await Deno.readTextFile(KB_INDEX_PATH);
    return JSON.parse(content) as KBIndex;
  } catch (error) {
    console.log('KB index not found or invalid:', error.message);
    return null;
  }
}

async function searchKnowledgeBase(query: string): Promise<{ hits: SearchHit[]; total: number }> {
  const index = await loadKBIndex();
  
  if (!index || !index.docs || index.docs.length === 0) {
    return { hits: [], total: 0 };
  }
  
  const scored = index.docs
    .map(doc => ({
      doc,
      score: calculateTfIdf(query, doc, index.docs)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8); // Top 8 results
  
  const hits: SearchHit[] = scored.map(({ doc, score }) => ({
    id: doc.id,
    title: doc.title,
    excerpt: generateExcerpt(doc.content, query),
    updatedAt: doc.updatedAt,
    score: Math.min(1, score), // Normalize to 0-1
    filePath: doc.filePath,
  }));
  
  return { hits, total: scored.length };
}

// Handle urgent ticket escalation
async function handleUrgentEscalation(ticket: Ticket) {
  const webhookUrl = Deno.env.get('ESCALATION_WEBHOOK');
  
  if (!webhookUrl) {
    console.log('No ESCALATION_WEBHOOK configured, skipping urgent notification');
    return;
  }
  
  const payload = {
    type: 'biancadesk.ticket.escalated',
    ticket,
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      console.error('Failed to send escalation webhook:', response.status, response.statusText);
    } else {
      console.log('Urgent ticket escalation sent successfully');
    }
  } catch (error) {
    console.error('Error sending escalation webhook:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const url = new URL(req.url);
    
    if (req.method === 'GET' && (url.pathname === '/api/config' || url.pathname === '/config')) {
      const config = {
        flamerouterCloudUrl: Deno.env.get('FLAMEROUTER_CLOUD_URL') || '',
        flamerouterLocalUrl: Deno.env.get('FLAMEROUTER_LOCAL_URL') || '',
        port: parseInt(Deno.env.get('PORT') || '7070'),
        escalationWebhook: !!Deno.env.get('ESCALATION_WEBHOOK'),
      };
      
      return new Response(JSON.stringify(config), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    if (req.method === 'GET' && (url.pathname === '/api/status' || url.pathname === '/status')) {
      const startTime = Date.now() - (performance.now() * 1000);
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      
      const status = {
        status: 'healthy',
        uptime,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };
      
      return new Response(JSON.stringify(status), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    if (req.method === 'GET' && (url.pathname === '/api/search' || url.pathname === '/search')) {
      const query = url.searchParams.get('q');
      
      if (!query) {
        return new Response(
          JSON.stringify({ error: 'Query parameter "q" is required' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
      
      const results = await searchKnowledgeBase(query);
      
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    if (req.method === 'GET' && (url.pathname === '/api/tickets' || url.pathname === '/tickets')) {
      const tickets = await getTickets();
      
      return new Response(JSON.stringify(tickets), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    if (req.method === 'POST' && (url.pathname === '/api/tickets' || url.pathname === '/tickets')) {
      const body = await req.json();
      const { summary, urgent } = body;
      
      if (!summary || typeof summary !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Summary is required and must be a string' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
      
      const ticket = await createTicket(summary, urgent);
      
      return new Response(JSON.stringify(ticket), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
})