#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_DIR = path.join(__dirname, '..', 'kb');
const OUTPUT_FILE = path.join(KB_DIR, 'index.json');

// Parse command line arguments
const args = process.argv.slice(2);
const includePdf = args.includes('--pdf');

async function extractTextFromPdf(filePath) {
  if (!includePdf) return null;
  
  try {
    // Dynamic import for pdf-parse (only when needed)
    const pdfParse = await import('pdf-parse');
    const pdfBuffer = await fs.readFile(filePath);
    const data = await pdfParse.default(pdfBuffer);
    return data.text;
  } catch (error) {
    console.warn(`Failed to parse PDF ${filePath}: ${error.message}`);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.warn('Install pdf-parse with: npm install pdf-parse');
    }
    return null;
  }
}

async function extractTextFromMarkdown(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    // Extract title from first # heading or use filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
    
    // Remove markdown formatting for content
    const cleanContent = content
      .replace(/^#.*$/gm, '') // Remove headings
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .trim();
    
    return { title, content: cleanContent };
  } catch (error) {
    console.warn(`Failed to parse markdown ${filePath}: ${error.message}`);
    return null;
  }
}

async function generateId(filePath) {
  // Simple hash function for generating IDs
  const str = path.relative(KB_DIR, filePath);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

async function ingestFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const stats = await fs.stat(filePath);
  const id = await generateId(filePath);
  
  let title, content;
  
  if (ext === '.md') {
    const result = await extractTextFromMarkdown(filePath);
    if (!result) return null;
    title = result.title;
    content = result.content;
  } else if (ext === '.pdf' && includePdf) {
    content = await extractTextFromPdf(filePath);
    if (!content) return null;
    title = path.basename(filePath, '.pdf');
  } else {
    return null; // Skip unsupported files
  }
  
  return {
    id,
    title,
    content,
    updatedAt: stats.mtime.toISOString(),
    filePath: path.relative(KB_DIR, filePath)
  };
}

async function scanDirectory(dir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanDirectory(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.md' || (ext === '.pdf' && includePdf)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to scan directory ${dir}: ${error.message}`);
  }
  
  return files;
}

async function main() {
  console.log('🔍 Starting knowledge base ingestion...');
  console.log(`📁 Scanning: ${KB_DIR}`);
  console.log(`📄 PDF support: ${includePdf ? 'enabled' : 'disabled'}`);
  
  try {
    // Ensure KB directory exists
    await fs.mkdir(KB_DIR, { recursive: true });
    
    // Scan for files
    const files = await scanDirectory(KB_DIR);
    console.log(`📋 Found ${files.length} files to process`);
    
    if (files.length === 0) {
      console.log('⚠️  No markdown files found in kb/ directory');
      console.log('💡 Add some .md files to get started!');
    }
    
    // Process files
    const docs = [];
    for (const file of files) {
      console.log(`📖 Processing: ${path.relative(KB_DIR, file)}`);
      const doc = await ingestFile(file);
      if (doc) {
        docs.push(doc);
      }
    }
    
    // Generate index
    const index = {
      docs,
      generatedAt: new Date().toISOString(),
      totalDocs: docs.length
    };
    
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2));
    
    console.log(`✅ Successfully indexed ${docs.length} documents`);
    console.log(`💾 Output: ${OUTPUT_FILE}`);
    console.log('🚀 Ready to search!');
    
  } catch (error) {
    console.error('❌ Error during ingestion:', error.message);
    process.exit(1);
  }
}

main();