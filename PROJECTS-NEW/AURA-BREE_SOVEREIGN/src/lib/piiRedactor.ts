/**
 * PII Redaction and Security Layer for Sovereign AURA-BREE
 * Client-side PII redaction with regex/Bloom filters and consent management
 */

export interface RedactionResult {
  redactedText: string;
  originalText: string;
  detectedPII: PIIDetection[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PIIDetection {
  type: PIIType;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

export type PIIType = 
  | 'phone' 
  | 'email' 
  | 'ssn' 
  | 'address' 
  | 'name' 
  | 'date_of_birth' 
  | 'credit_card' 
  | 'ip_address'
  | 'postal_code'
  | 'medical_id';

export interface ConsentSettings {
  cloudProcessingAllowed: boolean;
  dataRetentionDays: number;
  shareWithClinicians: boolean;
  anonymousAnalytics: boolean;
  emergencyOverride: boolean;
}

export interface EncryptionConfig {
  algorithm: string;
  keyDerivation: string;
  iterations: number;
  saltLength: number;
}

// PII Detection Patterns
const PII_PATTERNS: Record<PIIType, RegExp[]> = {
  phone: [
    /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/g
  ],
  email: [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  ],
  ssn: [
    /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
    /\b\d{9}\b/g
  ],
  address: [
    /\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi,
    /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi
  ],
  name: [
    // Common name patterns (basic detection)
    /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
    /\bMr\.?\s+[A-Z][a-z]+/g,
    /\bMrs\.?\s+[A-Z][a-z]+/g,
    /\bMs\.?\s+[A-Z][a-z]+/g,
    /\bDr\.?\s+[A-Z][a-z]+/g
  ],
  date_of_birth: [
    /\b(?:0[1-9]|1[0-2])[-/.](?:0[1-9]|[12]\d|3[01])[-/.](?:19|20)\d{2}\b/g,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+(?:19|20)\d{2}\b/gi
  ],
  credit_card: [
    /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g
  ],
  ip_address: [
    /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g
  ],
  postal_code: [
    /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/g, // Canadian
    /\b\d{5}(?:-\d{4})?\b/g // US ZIP
  ],
  medical_id: [
    /\b(?:MRN|Medical Record|Patient ID|Health Card)[\s:]+[A-Z0-9-]+\b/gi,
    /\b[A-Z]{2,4}\d{6,12}\b/g
  ]
};

// Common PII terms for Bloom filter
const PII_TERMS = [
  'social security', 'ssn', 'sin', 'phone number', 'email address', 'home address',
  'date of birth', 'dob', 'birthday', 'credit card', 'visa', 'mastercard',
  'medical record', 'patient id', 'health card', 'insurance', 'medicare',
  'full name', 'first name', 'last name', 'maiden name', 'mother maiden'
];

// Simple Bloom filter implementation
class BloomFilter {
  private bitArray: boolean[];
  private hashFunctions: number;
  private size: number;

  constructor(size: number = 10000, hashFunctions: number = 3) {
    this.size = size;
    this.hashFunctions = hashFunctions;
    this.bitArray = new Array(size).fill(false);
    
    // Add PII terms to filter
    PII_TERMS.forEach(term => this.add(term));
  }

  private hash(str: string, seed: number): number {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % this.size;
  }

  add(item: string): void {
    const normalized = item.toLowerCase();
    for (let i = 0; i < this.hashFunctions; i++) {
      const index = this.hash(normalized, i);
      this.bitArray[index] = true;
    }
  }

  mightContain(item: string): boolean {
    const normalized = item.toLowerCase();
    for (let i = 0; i < this.hashFunctions; i++) {
      const index = this.hash(normalized, i);
      if (!this.bitArray[index]) {
        return false;
      }
    }
    return true;
  }
}

// Global Bloom filter instance
const bloomFilter = new BloomFilter();

/**
 * Detect PII in text using regex patterns
 */
function detectPIIWithRegex(text: string): PIIDetection[] {
  const detections: PIIDetection[] = [];

  Object.entries(PII_PATTERNS).forEach(([type, patterns]) => {
    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(text)) !== null) {
        detections.push({
          type: type as PIIType,
          value: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          confidence: 0.8 // High confidence for regex matches
        });
      }
    });
  });

  return detections;
}

/**
 * Detect potential PII using Bloom filter
 */
function detectPIIWithBloom(text: string): PIIDetection[] {
  const detections: PIIDetection[] = [];
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach((word, index) => {
    if (bloomFilter.mightContain(word)) {
      const startIndex = text.toLowerCase().indexOf(word);
      if (startIndex >= 0) {
        detections.push({
          type: 'name', // Generic type for Bloom filter hits
          value: word,
          startIndex,
          endIndex: startIndex + word.length,
          confidence: 0.3 // Lower confidence for Bloom filter
        });
      }
    }
  });

  return detections;
}

/**
 * Redact detected PII from text
 */
function redactPII(text: string, detections: PIIDetection[]): string {
  let redactedText = text;
  
  // Sort detections by start index in reverse order to avoid index shifting
  const sortedDetections = [...detections].sort((a, b) => b.startIndex - a.startIndex);
  
  sortedDetections.forEach(detection => {
    const replacement = `[${detection.type.toUpperCase()}_REDACTED]`;
    redactedText = 
      redactedText.substring(0, detection.startIndex) +
      replacement +
      redactedText.substring(detection.endIndex);
  });

  return redactedText;
}

/**
 * Calculate risk level based on detected PII
 */
function calculateRiskLevel(detections: PIIDetection[]): 'low' | 'medium' | 'high' {
  if (detections.length === 0) return 'low';
  
  const highRiskTypes = ['ssn', 'credit_card', 'medical_id'];
  const mediumRiskTypes = ['phone', 'email', 'address', 'date_of_birth'];
  
  const hasHighRisk = detections.some(d => highRiskTypes.includes(d.type));
  const hasMediumRisk = detections.some(d => mediumRiskTypes.includes(d.type));
  
  if (hasHighRisk) return 'high';
  if (hasMediumRisk || detections.length > 3) return 'medium';
  return 'low';
}

/**
 * Main PII redaction function
 */
export function redactPIIFromText(text: string): RedactionResult {
  if (!text || typeof text !== 'string') {
    return {
      redactedText: text,
      originalText: text,
      detectedPII: [],
      riskLevel: 'low'
    };
  }

  // Detect PII using both methods
  const regexDetections = detectPIIWithRegex(text);
  const bloomDetections = detectPIIWithBloom(text);
  
  // Combine and deduplicate detections
  const allDetections = [...regexDetections, ...bloomDetections];
  const uniqueDetections = allDetections.filter((detection, index, array) => 
    array.findIndex(d => 
      d.startIndex === detection.startIndex && 
      d.endIndex === detection.endIndex
    ) === index
  );

  // Redact the text
  const redactedText = redactPII(text, uniqueDetections);
  const riskLevel = calculateRiskLevel(uniqueDetections);

  return {
    redactedText,
    originalText: text,
    detectedPII: uniqueDetections,
    riskLevel
  };
}

/**
 * Get user consent settings
 */
export function getConsentSettings(): ConsentSettings {
  try {
    const stored = localStorage.getItem('ab:consent:settings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Fall through to defaults
  }

  // Default to privacy-first settings
  return {
    cloudProcessingAllowed: import.meta.env.VITE_CLOUD_CONSENT_DEFAULT === 'true',
    dataRetentionDays: 30,
    shareWithClinicians: true,
    anonymousAnalytics: false,
    emergencyOverride: true
  };
}

/**
 * Update user consent settings
 */
export function updateConsentSettings(settings: Partial<ConsentSettings>): void {
  try {
    const current = getConsentSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('ab:consent:settings', JSON.stringify(updated));
    console.log('[PII Redactor] Consent settings updated:', updated);
  } catch (error) {
    console.error('[PII Redactor] Failed to update consent settings:', error);
  }
}

/**
 * Check if cloud processing is allowed
 */
export function isCloudProcessingAllowed(): boolean {
  const consent = getConsentSettings();
  return consent.cloudProcessingAllowed;
}

/**
 * Check if PII redaction is enabled
 */
export function isPIIRedactionEnabled(): boolean {
  return import.meta.env.VITE_PII_REDACTION_ENABLED === 'true';
}

/**
 * Process text with appropriate privacy level
 */
export function processTextWithPrivacy(text: string, forCloudProcessing: boolean = false): string {
  if (!isPIIRedactionEnabled()) {
    return text;
  }

  if (forCloudProcessing && !isCloudProcessingAllowed()) {
    throw new Error('Cloud processing not allowed by user consent');
  }

  const result = redactPIIFromText(text);
  
  // Log redaction for audit
  if (result.detectedPII.length > 0) {
    console.log(`[PII Redactor] Redacted ${result.detectedPII.length} PII items (${result.riskLevel} risk)`);
  }

  return forCloudProcessing ? result.redactedText : text;
}
