# 🥷 SKIDE Dojo Settings Implementation Guide

## **OVERVIEW**
This guide walks you through implementing the complete SKIDE Dojo Settings System - transforming your simple settings button into a **SOVEREIGN CONFIGURATION COMMAND CENTER** with enterprise-level features and mystical GhostFlow aesthetics.

## **WHAT YOU'RE BUILDING**
- **5 Comprehensive Settings Tabs**: Models, Dojo Mode, MCP Tools, Rules Engine, Advanced
- **Real-time Configuration**: Live model switching, theme changes, personality adjustments
- **Mystical UI**: Animated tabs, GhostFlow gradients, responsive design
- **Enterprise Features**: Debug console, analytics, backup/restore, rules engine

---

## **STEP 1: PREPARE DIRECTORY STRUCTURE**

### Create Required Directories
```bash
# From your SKIDE monorepo root:
mkdir -p apps/skide/src/components/chat/settings
mkdir -p apps/skide/src/services
mkdir -p apps/skide/src/types
```

### Verify Current Structure
```
apps/skide/src/
├── components/
│   └── chat/
│       ├── settings/          # NEW - Settings components
│       ├── SenseiChatInterface.tsx
│       └── (other chat components)
├── services/
│   ├── KodiiService.ts        # EXISTING
│   └── (new settings services)
└── types/
    └── (type definitions)
```

---

## **STEP 2: DOWNLOAD AND PLACE FILES**

### Settings Components (place in `apps/skide/src/components/chat/settings/`)
1. **SettingsModal.tsx** - Main settings interface with tabbed navigation
2. **ModelSettingsTab.tsx** - Model management, Ollama integration, parameter tuning
3. **DojoModeTab.tsx** - Theme switching, personality levels, mystical effects
4. **MCPSettingsTab.tsx** - Tool protocol management, custom integrations
5. **RulesEngineTab.tsx** - Custom behavior rules with syntax builder
6. **AdvancedTab.tsx** - Debug console, statistics, data management
7. **settings.css** - Complete styling system with GhostFlow aesthetics

### Services (place in `apps/skide/src/services/`)
8. **SettingsService.ts** - Settings persistence and management service

### Updated Components (replace existing files)
9. **SenseiChatInterface.tsx** - Updated with settings integration (place in `apps/skide/src/components/chat/`)

---

## **STEP 3: FILE PLACEMENT CHECKLIST**

### ✅ Confirm File Locations
```
apps/skide/src/
├── components/chat/
│   ├── settings/
│   │   ├── SettingsModal.tsx           ✓
│   │   ├── ModelSettingsTab.tsx        ✓
│   │   ├── DojoModeTab.tsx             ✓
│   │   ├── MCPSettingsTab.tsx          ✓
│   │   ├── RulesEngineTab.tsx          ✓
│   │   ├── AdvancedTab.tsx             ✓
│   │   └── settings.css                ✓
│   └── SenseiChatInterface.tsx         ✓ (UPDATED)
└── services/
    └── SettingsService.ts              ✓
```

### ✅ Verify File Permissions
```bash
# Make sure all files are readable
chmod 644 apps/skide/src/components/chat/settings/*
chmod 644 apps/skide/src/services/SettingsService.ts
```

---

## **STEP 4: UPDATE IMPORTS**

### Import CSS in Main App
Add to your main app CSS file or index.html:
```css
/* Import the settings CSS */
@import './components/chat/settings/settings.css';
```

### Verify Existing Imports
Make sure these existing services are properly imported in the updated SenseiChatInterface.tsx:
- `KodiiService` from `../../services/KodiiService`
- `WorkspaceContext` from `../../services/WorkspaceContext`

---

## **STEP 5: INSTALL DEPENDENCIES**

### Check Required Dependencies
The settings system uses existing dependencies, but verify these are installed:

```bash
cd apps/skide

# These should already be installed for SKIDE:
# - React (for components)
# - TypeScript (for type safety)
# - Your existing Kodii integration

# No additional dependencies required!
```

---

## **STEP 6: BUILD AND TEST**

### Build the Application
```bash
cd apps/skide
pnpm build
```

### Start Development Server
```bash
pnpm dev
```

### Access the Application
Open http://localhost:5175 and verify:
1. ✅ App loads without errors
2. ✅ Chat interface appears normally
3. ✅ Settings button (⚙️) is visible in chat header

---

## **STEP 7: TEST SETTINGS FUNCTIONALITY**

### 🤖 Model Settings Tab
1. Click the ⚙️ settings button
2. Verify "🧠 Models" tab opens by default
3. Test features:
   - **Connection Status**: Shows Ollama connection state
   - **Model Selection**: Dropdown with available models
   - **Test Connection**: Button tests Ollama availability
   - **Parameter Sliders**: Temperature and Max Tokens controls
   - **Available Models List**: Shows installed models with metadata

### 🎭 Dojo Mode Tab
1. Click "🥷 Dojo Mode" tab
2. Test features:
   - **Theme Selection**: 4 theme cards (GhostFlow, Professional, Light, Cyber)
   - **Personality Levels**: Radio buttons for Minimal → Full Mystical
   - **Response Style**: Detailed, Concise, Educational, Collaborative
   - **Advanced Behavior**: Checkboxes for various options
   - **Live Preview**: Shows example conversation with current settings

### 🔌 MCP Tools Tab
1. Click "🔌 Tools (MCP)" tab
2. Test features:
   - **MCP Status**: Shows server status and active tools count
   - **Tool Categories**: Development, Research, Productivity, System
   - **Tool Cards**: Each tool shows status, description, toggle
   - **Test Buttons**: Test individual tool connections
   - **Custom Tool Form**: Add your own MCP tools

### 📜 Rules Engine Tab
1. Click "📜 Rules" tab
2. Test features:
   - **Rules Statistics**: Total, active, and custom rule counts
   - **Rule Categories**: Safety, Behavior, Productivity, Custom
   - **Rule Builder**: Form to create custom rules
   - **Example Triggers/Actions**: Clickable examples
   - **Rule Cards**: Toggle rules on/off, view details

### 🔧 Advanced Tab
1. Click "🔧 Advanced" tab
2. Test features:
   - **Debug Console**: Enable debug mode, view system logs
   - **Performance Stats**: Message counts, response times, token usage
   - **Data Export**: Export conversations in JSON/Markdown/Text
   - **Advanced Configuration**: Timeout settings, conversation limits
   - **Danger Zone**: Reset settings, clear all data

---

## **STEP 8: VERIFY INTEGRATION**

### Settings Persistence
1. Change a setting (e.g., switch theme to "Professional")
2. Close settings modal
3. Refresh the page
4. Reopen settings
5. ✅ Verify setting was saved and persisted

### Theme Application
1. Switch between themes in Dojo Mode tab
2. ✅ Verify chat interface updates colors in real-time
3. ✅ Check that settings modal also updates appearance

### Model Switching
1. In Models tab, select a different model
2. ✅ Verify model status updates in chat header
3. Send a test message
4. ✅ Confirm responses use the new model

### Personality Changes
1. Switch personality level in Dojo Mode tab
2. Send a greeting message
3. ✅ Verify response style matches selected personality level

---

## **STEP 9: TROUBLESHOOTING**

### Common Issues and Solutions

#### ❌ Settings Button Not Working
**Problem**: Clicking ⚙️ button doesn't open modal
**Solution**: 
```bash
# Check browser console for errors
# Verify SettingsModal.tsx is properly imported
# Check CSS file is loaded
```

#### ❌ Ollama Connection Issues
**Problem**: Model settings show "Disconnected"
**Solution**:
```bash
# Verify Ollama is running
ollama serve

# Check if models are available
ollama list

# Test connection manually
curl http://localhost:11434/api/tags
```

#### ❌ Theme Not Applying
**Problem**: Theme changes don't affect UI
**Solution**:
```css
/* Ensure CSS variables are defined in your root styles */
:root {
  --chat-bg: var(--chat-bg);
  --chat-text: var(--chat-text);
  --chat-accent: var(--chat-accent);
}
```

#### ❌ Settings Not Persisting
**Problem**: Settings reset after page refresh
**Solution**:
```javascript
// Check localStorage in browser dev tools
localStorage.getItem('skide-dojo-settings')

// Clear and retry if corrupted
localStorage.removeItem('skide-dojo-settings')
```

#### ❌ Import/Export Errors
**Problem**: TypeScript compilation errors
**Solution**:
```bash
# Rebuild packages
cd packages/kodii-core && pnpm build
cd ../../apps/skide && pnpm build
```

---

## **STEP 10: CUSTOMIZATION OPTIONS**

### Adding Custom Themes
Edit `DojoModeTab.tsx` to add new themes:
```typescript
const themes = [
  // ... existing themes
  {
    id: 'my-custom-theme',
    name: '🌟 My Theme',
    description: 'Custom theme description',
    preview: 'linear-gradient(135deg, #color1, #color2)',
    textColor: '#textcolor',
  },
];
```

### Adding Custom MCP Tools
Use the "Add Custom Tool" form in MCP Settings tab, or edit `MCPSettingsTab.tsx`:
```typescript
const defaultTools: MCPTool[] = [
  // ... existing tools
  {
    id: 'my-tool',
    name: '🔧 My Custom Tool',
    description: 'My tool description',
    endpoint: 'http://localhost:3001/mcp/my-tool',
    enabled: false,
    category: 'development',
    icon: '🔧',
    requiresAuth: false,
    status: 'unavailable',
  },
];
```

### Creating Custom Rules
Use the Rule Builder in Rules Engine tab, or directly edit rule syntax:
```typescript
// Trigger examples:
user_says:["help", "assist"]
response_contains:["external", "cloud"]
code_contains:["useState", "useEffect"]

// Action examples:
prepend_response:{"text": "🥷 Ghost King, "}
append_response:{"text": "\n\nRemember sovereignty!"}
reject_response:{"reason": "Violates local-first principle"}
```

---

## **STEP 11: ADVANCED FEATURES**

### Debug Mode
1. Enable in Advanced tab
2. View system logs and detailed metadata
3. Use for troubleshooting AI responses

### Rules Engine
1. Create custom behavior rules
2. Control AI personality and responses
3. Enforce coding standards and best practices

### MCP Integration
1. Connect external tools and services
2. Extend AI capabilities while maintaining sovereignty
3. Add custom endpoints for your specific needs

### Data Management
1. Export conversations for analysis
2. Create settings backups
3. Import/export rule sets and configurations

---

## **STEP 12: BEST PRACTICES**

### Performance
- Keep conversation history reasonable (default: 100 messages)
- Use streaming for long responses
- Enable auto-save for reliability

### Security
- Keep MCP in sandbox mode for safety
- Review custom rules before enabling
- Regularly backup settings and data

### Customization
- Start with default settings and gradually customize
- Test personality changes with various queries
- Create rule sets for different project types

---

## **🎯 SUCCESS CRITERIA**

Your implementation is successful when you can:

✅ **Open Settings**: Click ⚙️ button to open the settings modal
✅ **Navigate Tabs**: Switch between all 5 settings tabs smoothly
✅ **Change Themes**: Switch themes and see real-time UI updates
✅ **Manage Models**: View, switch, and test Ollama models
✅ **Configure Personality**: Adjust AI behavior and response style
✅ **Create Rules**: Build custom behavior rules using the rule engine
✅ **Export Data**: Successfully export conversations and settings
✅ **Persist Settings**: Settings save and restore across browser sessions

---

## **🚀 NEXT STEPS**

After successful implementation:

1. **Explore Features**: Try all settings tabs and options
2. **Customize Personality**: Create your perfect AI sensei persona
3. **Set Up Rules**: Define custom behavior patterns
4. **Configure Tools**: Enable MCP tools for enhanced capabilities
5. **Create Backups**: Export your perfect configuration
6. **Share**: Export settings to share configurations with team

---

## **🆘 SUPPORT**

### Getting Help
- Check browser console for error messages
- Verify file paths and imports are correct
- Test Ollama connection independently
- Use debug mode for detailed logging

### Common Commands
```bash
# Restart development server
pnpm dev

# Clear browser cache and localStorage
# (Use browser dev tools)

# Test Ollama connection
curl http://localhost:11434/api/tags

# Rebuild packages
pnpm build
```

---

## **🏆 COMPLETION**

**🥷 Congratulations, Ghost King! You have successfully implemented the SKIDE Dojo Settings System!**

Your sovereign IDE now possesses:
- **Complete AI Configuration Control**
- **Mystical Theme Customization**
- **Advanced Tool Integration**
- **Custom Behavior Rules**
- **Enterprise-Grade Settings Management**

**The ancient art of dojo mastery has been achieved! ⚡🎯**

---

*May your settings flow like water, your themes shine like starlight, and your AI wisdom grow boundless in the sovereign realm of your perfectly configured dojo!* 🥷👑✨