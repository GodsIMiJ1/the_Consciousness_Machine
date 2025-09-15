#!/usr/bin/env bash
set -euo pipefail

# Android Studio CLI-based setup (SDK-first, GUI-less path)
# This script installs the Android SDK command-line tools, sets up environment
# variables, accepts licenses, and fetches common build tools without using Android Studio.

SDK_ROOT="$HOME/Android/Sdk"
CMDLINE_TOOLS_DIR="$SDK_ROOT/cmdline-tools"
LATEST_DIR="$CMDLINE_TOOLS_DIR/latest"
TMP_ZIP="/tmp/commandlinetools-linux_latest.zip"
DOWNLOAD_URL="https://dl.google.com/android/repository/commandlinetools-linux_latest.zip"

LOG_FILE="$HOME/.android_cli_setup.log"

log() {
  local msg="$1"
  echo "[android-cli-setup] ${msg}" | tee -a "$LOG_FILE"
}

log "Starting Android CLI-based setup"

# Prereqs
if ! command -v unzip >/dev/null 2>&1; then
  echo "ERROR: unzip is required but not found. Install unzip and re-run." >&2
  exit 1
fi
if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
  echo "ERROR: curl or wget is required to download the SDK tools." >&2
  exit 1
fi

# 1) Create SDK directories
log "Ensuring SDK root at ${SDK_ROOT}"
mkdir -p "$SDK_ROOT"
mkdir -p "$CMDLINE_TOOLS_DIR"

# 2) Download command-line tools if not present
if [ -d "$LATEST_DIR" ]; then
  log "Command-line tools already initialized at ${LATEST_DIR}"
else
  log "Downloading Android command-line tools from ${DOWNLOAD_URL}"
  if command -v wget >/dev/null 2>&1; then
    wget -q -O "$TMP_ZIP" "$DOWNLOAD_URL"
  else
    curl -sS -L -o "$TMP_ZIP" "$DOWNLOAD_URL"
  fi

  log "Extracting command-line tools to ${CMDLINE_TOOLS_DIR}"
  mkdir -p "$CMDLINE_TOOLS_DIR"
  unzip -q "$TMP_ZIP" -d "$CMDLINE_TOOLS_DIR"

  # Normalize to .../latest
  if [ -d "${CMDLINE_TOOLS_DIR}/cmdline-tools" ]; then
    mkdir -p "$LATEST_DIR"
    # Move contents of the inner cmdline-tools into latest
    if [ -d "${CMDLINE_TOOLS_DIR}/cmdline-tools"/* ]; then
      cp -r "${CMDLINE_TOOLS_DIR}/cmdline-tools"/* "$LATEST_DIR"/ 2>/dev/null || true
    fi
    # Cleanup
    rm -rf "${CMDLINE_TOOLS_DIR}/cmdline-tools"
  fi

  rm -f "$TMP_ZIP"
  log "Command-line tools setup complete"
fi

# 3) Add tools to PATH via ~/.bashrc (idempotent)
if grep -q "ANDROID_SDK_ROOT" "$HOME/.bashrc" 2>/dev/null; then
  log "Environment already configured in ~/.bashrc"
else
  log "Configuring environment variables in ~/.bashrc"
  {
    echo ""
    echo "# Android SDK environment (CLI setup)"
    echo "export ANDROID_SDK_ROOT=\"${SDK_ROOT}\""
    echo "export ANDROID_HOME=\"${SDK_ROOT}\""
    echo "export PATH=\"\\$PATH:${SDK_ROOT}/platform-tools:${SDK_ROOT}/tools:${SDK_ROOT}/tools/bin:${LATEST_DIR}/bin\""
  } >> "$HOME/.bashrc"

  # Source for current session (best-effort)
  if [ -f "$HOME/.bashrc" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.bashrc" >/dev/null 2>&1 || true
  fi
fi

# 4) Accept licenses and install required SDK components
SDKMANAGER="${LATEST_DIR}/bin/sdkmanager"
if [ ! -x "$SDKMANAGER" ]; then
  log "sdkmanager not found at ${SDKMANAGER}. Aborting."
  exit 1
fi

log "Accepting licenses (non-interactive)"
yes | "$SDKMANAGER" --licenses >/dev/null 2>&1 || true

log "Installing essential SDK components"
"$SDKMANAGER" "platform-tools" "platforms;android-33" "build-tools;33.0.0" >/dev/null 2>&1 || true

# 5) Optional: verify binaries
if command -v adb >/dev/null 2>&1 && command -v javac >/dev/null 2>&1; then
  log "SDK tools verified (adb and Java available)"
else
  log "Note: adb or Java not found in PATH. Ensure that PATH includes SDK binaries."
fi

log "CLI-based Android Studio setup complete. You can run 'adb --version' or 'sdkmanager --licenses' to verify."
exit 0
