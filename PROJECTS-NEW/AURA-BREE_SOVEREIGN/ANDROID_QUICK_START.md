# 📱 AURA-BREE Android Quick Start

## 🚀 **Complete Setup Commands**

### **One-Time Setup (Already Done)**
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor
npx cap init "AURA-BREE" "com.godsimij.aura_bree"

# Add Android platform
npm run build
npx cap add android
npx cap copy
npx cap sync android
```

## 🔧 **Development Workflow**

### **After Making Changes**
```bash
# 1. Build the web app
npm run build

# 2. Copy to Android
npx cap copy

# 3. Sync with Android
npx cap sync android

# 4. Open in Android Studio
npx cap open android
```

## 🏗️ **Build for Play Store**

### **In Android Studio**
1. **Open Project**: `npx cap open android`
2. **Build Bundle**: Menu → Build → Build Bundle(s) / APK(s) → Build Bundle(s)
3. **Output Location**: `android/app/build/outputs/bundle/release/app-release.aab`
4. **Upload to Play Console**: Use the `.aab` file

## 📱 **App Configuration**

### **App Details**
- **Name**: AURA-BREE
- **Package**: com.godsimij.aura_bree
- **Version**: 1.0.0 (from package.json)

### **Permissions**
- ✅ INTERNET (OpenAI API calls)
- ✅ RECORD_AUDIO (Voice input)
- ✅ VIBRATE (Haptic feedback)

### **Play Store Ready**
- ✅ AndroidManifest.xml configured
- ✅ App icons and splash screen
- ✅ Privacy-compliant permissions
- ✅ Data safety form ready

## 🎯 **Key Features**
- **100% Local Storage** (Privacy-first)
- **Offline Core Features** (No internet required for basic use)
- **Voice Input** (Push-to-talk for accessibility)
- **Crisis Resources** (Always available emergency tools)
- **PWA Integration** (Web app wrapped in native container)

## 📊 **Play Console Data Safety**
- **Data Collected**: Anonymous device ID only
- **Data Shared**: None (everything stays local)
- **Encryption**: HTTPS for API calls
- **User Control**: Complete export/delete capabilities

## 🚨 **Troubleshooting**

### **Build Issues**
```bash
# Clean and rebuild
cd android
./gradlew clean
npx cap sync android
```

### **Content Not Loading**
```bash
# Rebuild web app and sync
npm run build
npx cap copy
npx cap sync android
```

## 📞 **Support**
- **Technical**: See `docs/ANDROID_BUILD_GUIDE.md`
- **Issues**: Check Android Studio build logs
- **Play Store**: Follow Google Play Console guidelines

**Ready to build and deploy AURA-BREE to Google Play Store! 🚀**
