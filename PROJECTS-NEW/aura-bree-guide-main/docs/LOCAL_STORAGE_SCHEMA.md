# 🗄️ AURA-BREE Local Storage Schema

## 📋 **Overview**

AURA-BREE uses browser localStorage exclusively for data persistence, ensuring 100% privacy by keeping all user data on their device. This document outlines the complete data structure and storage patterns.

## 🔑 **Storage Key Patterns**

### **Global Settings (No Device ID)**
```typescript
// User preferences that persist across devices
ab_device_id: string              // Unique device identifier
ab_zodiac_sign: string           // User's astrological sign
ab_voice_enabled: string         // "true" | "false" - TTS preference
ab_notifications_enabled: string // "true" | "false" - Notification preference
ab_ref: string                   // User's referral code (AB-XXXXXX)
ab_referred_by: string           // Referral code that brought this user
```

### **Device-Specific Data (Namespaced)**
```typescript
// All user data namespaced by device ID for isolation
ab:${deviceId}:messages: string          // Chat conversation history
ab:${deviceId}:checkins: string          // Mood tracking data
ab:${deviceId}:tarot: string             // Tarot reading history
ab:${deviceId}:oracle_messages: string   // Dream analysis history
```

## 🏗️ **Data Structures**

### **Device Identification**
```typescript
// Device ID Generation
interface DeviceInfo {
  id: string;           // crypto.randomUUID()
  created: string;      // ISO timestamp
  lastSeen: string;     // ISO timestamp
}

// Storage: ab_device_id
// Value: "550e8400-e29b-41d4-a716-446655440000"
```

### **User Preferences**
```typescript
interface UserPreferences {
  zodiacSign: ZodiacSign;
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  theme?: 'dark' | 'light';
  language?: string;
}

type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer' 
  | 'leo' | 'virgo' | 'libra' | 'scorpio' 
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

// Storage Examples:
// ab_zodiac_sign: "scorpio"
// ab_voice_enabled: "true"
// ab_notifications_enabled: "false"
```

### **Chat Messages**
```typescript
interface Message {
  id: string;           // Unique message ID
  role: 'user' | 'assistant';
  content: string;      // Message text
  timestamp: string;    // ISO timestamp
  type?: 'text' | 'voice' | 'crisis';
  metadata?: {
    voiceInput?: boolean;
    crisisDetected?: boolean;
    responseTime?: number;
  };
}

interface ChatHistory {
  messages: Message[];
  lastUpdated: string;
  totalMessages: number;
}

// Storage: ab:${deviceId}:messages
// Value: JSON.stringify(ChatHistory)
```

### **Mood Check-ins**
```typescript
interface CheckIn {
  id: string;           // Unique check-in ID
  score: number;        // 1-10 mood scale
  note?: string;        // Optional user note
  timestamp: string;    // ISO timestamp
  tags?: string[];      // Optional mood tags
  triggers?: string[];  // Optional trigger identification
}

interface MoodData {
  checkIns: CheckIn[];
  streak: number;       // Current consecutive days
  longestStreak: number;
  totalCheckIns: number;
  averageMood: number;
  lastUpdated: string;
}

// Storage: ab:${deviceId}:checkins
// Value: JSON.stringify(MoodData)
```

### **Tarot Readings**
```typescript
interface TarotCard {
  name: string;         // Card name
  suit?: string;        // Major/Minor Arcana
  meaning: string;      // Card interpretation
  position: 'past' | 'present' | 'future';
  reversed?: boolean;   // Card orientation
}

interface TarotReading {
  id: string;           // Unique reading ID
  question?: string;    // User's question
  cards: TarotCard[];   // 3-card spread
  interpretation: string; // AI interpretation
  timestamp: string;    // ISO timestamp
  saved: boolean;       // User saved this reading
}

interface TarotHistory {
  readings: TarotReading[];
  totalReadings: number;
  favoriteCards: string[];
  lastUpdated: string;
}

// Storage: ab:${deviceId}:tarot
// Value: JSON.stringify(TarotHistory)
```

### **Dream Analysis**
```typescript
interface DreamEntry {
  id: string;           // Unique dream ID
  content: string;      // Dream description
  interpretation: string; // AI analysis
  symbols: string[];    // Identified symbols
  emotions: string[];   // Emotional themes
  timestamp: string;    // ISO timestamp
  rating?: number;      // User rating of interpretation
}

interface OracleData {
  dreams: DreamEntry[];
  totalDreams: number;
  commonSymbols: Record<string, number>;
  lastUpdated: string;
}

// Storage: ab:${deviceId}:oracle_messages
// Value: JSON.stringify(OracleData)
```

### **Referral System**
```typescript
interface ReferralData {
  code: string;         // User's referral code (AB-XXXXXX)
  referredBy?: string;  // Code that referred this user
  referrals: string[];  // Codes this user referred
  rewards: {
    freeMonths: number;
    premiumUntil?: string;
  };
  created: string;      // ISO timestamp
}

// Storage: ab_ref, ab_referred_by
// Values: "AB-X7K9M2", "AB-A1B2C3"
```

## 🔧 **Storage Operations**

### **Device ID Management**
```typescript
export function getDeviceId(): string {
  let deviceId = localStorage.getItem('ab_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('ab_device_id', deviceId);
    localStorage.setItem('ab_device_created', new Date().toISOString());
  }
  localStorage.setItem('ab_device_last_seen', new Date().toISOString());
  return deviceId;
}
```

### **Data Persistence Helpers**
```typescript
// Generic storage helper
function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Storage failed:', error);
    // Handle storage quota exceeded
  }
}

function loadData<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Loading failed:', error);
    return defaultValue;
  }
}

// Device-specific storage
function saveDeviceData<T>(deviceId: string, type: string, data: T): void {
  const key = `ab:${deviceId}:${type}`;
  saveData(key, data);
}

function loadDeviceData<T>(deviceId: string, type: string, defaultValue: T): T {
  const key = `ab:${deviceId}:${type}`;
  return loadData(key, defaultValue);
}
```

### **Data Migration**
```typescript
// Handle schema updates
interface MigrationConfig {
  version: number;
  migrate: (data: any) => any;
}

const migrations: MigrationConfig[] = [
  {
    version: 1,
    migrate: (data) => {
      // Add new fields, transform existing data
      return { ...data, version: 1 };
    }
  }
];

function migrateData(key: string): void {
  const data = loadData(key, null);
  if (!data) return;
  
  const currentVersion = data.version || 0;
  const targetVersion = migrations.length;
  
  if (currentVersion < targetVersion) {
    let migratedData = data;
    for (let i = currentVersion; i < targetVersion; i++) {
      migratedData = migrations[i].migrate(migratedData);
    }
    saveData(key, migratedData);
  }
}
```

## 📊 **Storage Monitoring**

### **Storage Usage Tracking**
```typescript
function getStorageUsage(): {
  used: number;
  available: number;
  percentage: number;
} {
  let used = 0;
  for (let key in localStorage) {
    if (key.startsWith('ab')) {
      used += localStorage[key].length;
    }
  }
  
  // Estimate available space (varies by browser)
  const estimated = 5 * 1024 * 1024; // 5MB typical limit
  
  return {
    used,
    available: estimated - used,
    percentage: (used / estimated) * 100
  };
}
```

### **Data Export**
```typescript
function exportAllData(deviceId: string): object {
  const exportData = {
    deviceId,
    exportedAt: new Date().toISOString(),
    preferences: {
      zodiacSign: localStorage.getItem('ab_zodiac_sign'),
      voiceEnabled: localStorage.getItem('ab_voice_enabled'),
      notificationsEnabled: localStorage.getItem('ab_notifications_enabled'),
    },
    referral: {
      code: localStorage.getItem('ab_ref'),
      referredBy: localStorage.getItem('ab_referred_by'),
    },
    data: {
      messages: loadDeviceData(deviceId, 'messages', { messages: [] }),
      checkins: loadDeviceData(deviceId, 'checkins', { checkIns: [] }),
      tarot: loadDeviceData(deviceId, 'tarot', { readings: [] }),
      oracle: loadDeviceData(deviceId, 'oracle_messages', { dreams: [] }),
    }
  };
  
  return exportData;
}
```

### **Data Cleanup**
```typescript
function clearAllData(): void {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('ab'));
  keys.forEach(key => localStorage.removeItem(key));
}

function clearDeviceData(deviceId: string): void {
  const prefix = `ab:${deviceId}:`;
  const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
  keys.forEach(key => localStorage.removeItem(key));
}
```

## 🔒 **Privacy & Security**

### **Data Isolation**
- Each device gets a unique UUID for complete data separation
- No cross-device data sharing or synchronization
- Device ID cannot be traced back to user identity

### **Storage Security**
- All data stored in browser's secure localStorage
- No sensitive data in cookies or session storage
- Client-side only - never transmitted to servers
- Future: Client-side encryption for additional security

### **Data Retention**
- Data persists until user manually clears it
- No automatic expiration or cleanup
- User has complete control over their data
- Export functionality for data portability

## 📈 **Performance Considerations**

### **Storage Optimization**
- JSON compression for large datasets
- Lazy loading of historical data
- Pagination for large message histories
- Cleanup of old temporary data

### **Memory Management**
- Efficient data structures
- Minimal memory footprint
- Garbage collection friendly
- Optimized for mobile devices

**AURA-BREE's local storage schema ensures complete user privacy while providing efficient, scalable data management for all app features.** 🗄️
