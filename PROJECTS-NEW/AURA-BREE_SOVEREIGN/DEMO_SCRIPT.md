# 🎭 Sovereign AGA AURA-BREE Demo Script

**Demo Duration:** 15-20 minutes  
**Audience:** Technical stakeholders, clinic administrators  
**Objective:** Demonstrate local-first AI, clinic integration, and sovereign privacy features

## 🎬 Demo Flow

### Phase 1: Sovereign Privacy & Local AI (5 minutes)

#### 1.1 Show Privacy Mode Indicators
```
📱 Open mobile app → Settings → Sovereign tab
✅ Point out: "Sovereign Mode" with green lock icon
✅ Show provider status: Ollama (green), LM Studio (green), Cloud (locked)
✅ Explain: "All AI processing happens locally on your infrastructure"
```

#### 1.2 Demonstrate Local AI Chat
```
📱 Navigate to Chat tab
✅ Show FlameRouter status bar: "via ollama" indicator
✅ Send message: "I'm feeling anxious about my upcoming appointment"
✅ Point out: Response generated locally, no data sent to cloud
✅ Show response time and provider used
```

#### 1.3 PII Protection Demo
```
📱 Send message with PII: "My phone is 555-123-4567 and SSN is 123-45-6789"
✅ Show automatic redaction in real-time
✅ Explain: "Sensitive data is automatically detected and protected"
✅ Navigate to Settings → show PII redaction settings
```

### Phase 2: Offline-First Clinic Sync (5 minutes)

#### 2.1 Offline Check-in Demo
```
📱 Disconnect from internet (airplane mode or disable WiFi)
✅ Navigate to Check-in tab
✅ Perform mood check-in: Score 4/10, note "Feeling overwhelmed"
✅ Show "Queued (1)" indicator in status bar
✅ Perform second check-in: Score 6/10, note "Therapy helped"
✅ Show "Queued (2)" indicator
```

#### 2.2 Sync When Online
```
📱 Reconnect to internet
✅ Watch queue automatically sync
✅ Show status change: "Queued (2)" → "Synced to Clinic"
✅ Explain: "No data loss, even when offline for days"
```

#### 2.3 Clinic Dashboard Integration
```
💻 Switch to clinic dashboard (localhost:3001)
✅ Show real-time notification: "New check-in from Sovereign AURA-BREE"
✅ Display patient timeline with mood progression
✅ Show flagged entries (low mood, crisis indicators)
✅ Demonstrate audit trail with hash-chain verification
```

### Phase 3: Multi-Provider Failover (3 minutes)

#### 3.1 Provider Failover Demo
```
💻 Terminal: Stop Ollama service
docker-compose stop ollama

📱 Mobile app: Send chat message
✅ Show automatic failover to LM Studio
✅ Status bar updates: "via lmstudio"
✅ Response still generated locally
```

#### 3.2 Cloud Failover (Optional)
```
💻 Terminal: Stop LM Studio (if running)
📱 Settings: Enable "Cloud Processing" consent
✅ Send chat message
✅ Show failover to Hugging Face/OpenAI
✅ Status bar: "via hf" or "via openai"
✅ Explain consent-gated cloud usage
```

### Phase 4: Audit & Compliance (2 minutes)

#### 4.1 Audit Trail Demonstration
```
💻 Clinic dashboard: Navigate to Audit section
✅ Show immutable audit log with hash chain
✅ Demonstrate tamper detection
✅ Show compliance-ready reports
✅ Explain HIPAA/PHIPA compliance features
```

#### 4.2 Emergency Override
```
📱 Settings: Show "Emergency Override" toggle
✅ Explain break-glass access for crisis situations
✅ Show dual-authorization requirement
✅ Demonstrate automatic audit logging of emergency access
```

## 🎯 Key Demo Points to Emphasize

### 1. **Local-First Architecture**
- "Your data never leaves your infrastructure by default"
- "AI models run on your hardware, not in the cloud"
- "Complete control over patient information"

### 2. **Offline Resilience**
- "Works even when internet is down"
- "Automatic sync when connectivity returns"
- "No data loss, ever"

### 3. **Privacy by Design**
- "PII automatically detected and protected"
- "Consent-gated cloud usage"
- "Sovereign mode for maximum privacy"

### 4. **Clinical Integration**
- "Real-time dashboard updates"
- "Mood tracking and crisis detection"
- "Audit-grade compliance logging"

### 5. **Reliability & Failover**
- "Multiple AI providers for redundancy"
- "Automatic failover with no user intervention"
- "Local → Cloud progression based on consent"

## 🛠️ Demo Setup Checklist

### Before Demo
- [ ] All services running: `docker-compose ps`
- [ ] Ollama models loaded: `curl localhost:11434/api/tags`
- [ ] Mobile app accessible: `http://localhost:5173`
- [ ] Clinic dashboard ready: `http://localhost:3001`
- [ ] Test internet connectivity toggle
- [ ] Clear previous demo data if needed

### Demo Environment
- [ ] Large screen/projector for visibility
- [ ] Stable internet connection
- [ ] Backup mobile device/browser
- [ ] Terminal access for service control
- [ ] Demo data prepared (test check-ins, messages)

### Recovery Plans
- [ ] **If Ollama fails:** Use LM Studio or cloud providers
- [ ] **If sync fails:** Show offline queue functionality
- [ ] **If dashboard fails:** Use API endpoints directly
- [ ] **If mobile fails:** Use desktop browser version

## 📝 Demo Script Variations

### For Technical Audience (Extended)
- Show code structure and architecture
- Demonstrate API endpoints with curl
- Explain hash-chain cryptography
- Deep dive into provider configuration

### For Clinical Audience (Focused)
- Emphasize patient privacy and HIPAA compliance
- Focus on mood tracking and crisis detection
- Show clinical workflow integration
- Highlight offline capabilities for remote areas

### For Executive Audience (High-Level)
- Focus on sovereignty and data control
- Emphasize cost savings (local vs cloud)
- Show competitive advantages
- Highlight compliance and risk reduction

## 🎪 Demo Scenarios

### Scenario A: Rural Clinic
```
"Imagine a rural clinic with unreliable internet..."
→ Show offline functionality
→ Demonstrate local AI processing
→ Show sync when connectivity returns
```

### Scenario B: Privacy-Conscious Practice
```
"For practices prioritizing patient privacy..."
→ Show sovereign mode
→ Demonstrate PII redaction
→ Show local-only processing
```

### Scenario C: Crisis Management
```
"When a patient indicates self-harm..."
→ Show automatic flagging
→ Demonstrate real-time alerts
→ Show emergency override procedures
```

## 🔧 Troubleshooting During Demo

### Common Issues
1. **Slow AI responses:** Explain model loading time
2. **Sync delays:** Show queue status and retry logic
3. **Provider failures:** Demonstrate failover as feature
4. **UI glitches:** Have backup browser/device ready

### Recovery Phrases
- "This actually demonstrates our failover capability..."
- "Let me show you the audit trail for this..."
- "This is exactly why we built redundancy..."
- "The offline queue is working as designed..."

---

**🎭 Remember: Every demo challenge is an opportunity to showcase the system's resilience and thoughtful design.**
