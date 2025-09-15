#!/usr/bin/env bash
set -euo pipefail

# Android Studio setup script (idempotent)
# - Downloads the official Android Studio tarball if not present
# - Extracts to /opt/android-studio (if not already installed)
# - Creates/updates a symlink at /usr/local/bin/android-studio
# - Sets CAPACITOR_ANDROID_STUDIO_PATH in ~/.bashrc (idempotent)
# - Logs actions to a local log file for traceability

INSTALL_DIR="/opt/android-studio"
ARCHIVE_NAME="android-studio-2023.3.1.18-linux.tar.gz"
DOWNLOAD_URL="https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.3.1.18/android-studio-2023.3.1.18-linux.tar.gz"
TARBALL="/tmp/${ARCHIVE_NAME}"
BIN_PATH="${INSTALL_DIR}/bin/studio.sh"
SYMLINK="/usr/local/bin/android-studio"
LOG_FILE="$HOME/.android-studio-install.log"

log() {
  local msg="$1"
  echo "[android-studio-setup] ${msg}" | tee -a "$LOG_FILE"
}

log "Starting Android Studio setup (idempotent)"
# Ensure we have the archive name and download URL
log "Target install dir: ${INSTALL_DIR}"
log "Archive: ${ARCHIVE_NAME}"
log "Download URL: ${DOWNLOAD_URL}"

# 1) Install directory
if [ -d "$INSTALL_DIR" ]; then
  log "Android Studio already installed at ${INSTALL_DIR}"
else
  log "Creating install directory"
  sudo mkdir -p "$INSTALL_DIR"
fi

# 2) Download tarball if not present
if [ -f "$BIN_PATH" ]; then
  log "Android Studio binary already present at ${BIN_PATH} (installation may be complete)"
elif [ -f "$TARBALL" ]; then
  log "Found cached tarball at ${TARBALL}"
else
  log "Downloading Android Studio tarball..."
  if command -v wget >/dev/null 2>&1; then
    wget -q -O "$TARBALL" "$DOWNLOAD_URL"
  elif command -v curl >/dev/null 2>&1; then
    curl -L -s -o "$TARBALL" "$DOWNLOAD_URL"
  else
    log "Error: Neither wget nor curl is available to download files."
    exit 1
  fi
fi

# 3) Extract tarball (if not already extracted)
if [ -f "$BIN_PATH" ]; then
  log "Android Studio binary found after extraction."
else
  log "Extracting Android Studio into ${INSTALL_DIR}..."
  sudo tar -xzf "$TARBALL" -C "$INSTALL_DIR" --strip-components=1
  log "Extraction complete."
fi

# 4) Create/Update symlink
if [ -L "$SYMLINK" ] || [ -e "$SYMLINK" ]; then
  log "Updating existing symlink at ${SYMLINK}"
  sudo ln -sfn "$BIN_PATH" "$SYMLINK" || { log "Failed to update symlink"; exit 1; }
else
  log "Creating symlink at ${SYMLINK}"
  sudo ln -s "$BIN_PATH" "$SYMLINK" || { log "Failed to create symlink"; exit 1; }
fi

# 5) CAPACITOR_ANDROID_STUDIO_PATH environment variable
if grep -q "CAPACITOR_ANDROID_STUDIO_PATH" "$HOME/.bashrc" 2>/dev/null; then
  log "CAPACITOR_ANDROID_STUDIO_PATH already present in ~/.bashrc"
else
  log "Appending CAPACITOR_ANDROID_STUDIO_PATH to ~/.bashrc"
  echo 'export CAPACITOR_ANDROID_STUDIO_PATH="/opt/android-studio/bin/studio.sh"' >> "$HOME/.bashrc"
  # Try to source for current session if possible
  if [ -f "$HOME/.bashrc" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.bashrc" >/dev/null 2>&1 || true
  fi
fi

log "Android Studio setup completed. You may need to restart your terminal or run 'android-studio' to launch."
exit 0
