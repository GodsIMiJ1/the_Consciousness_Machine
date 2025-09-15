#!/usr/bin/env bash
set -euo pipefail

# Release script for Aura-BREE Android app (CLI-based)
# Assumes Android project layout exists under ./android
# Builds a release AAB using the Gradle wrapper and signing via injected properties.

REPO_ROOT="$(pwd)"
ANDROID_DIR="$REPO_ROOT/android"

# Ensure we're in the Android project
if [ ! -d "$ANDROID_DIR" ]; then
  echo "Error: android/ directory not found in repo. Run this from the project root." >&2
  exit 1
fi

# Signing configuration (must be provided for release)
STORE_FILE="${AURA_SIGNING_STORE_FILE:-./aura-bree-upload-key.keystore}"
# Normalize path to absolute if relative
if [[ "$STORE_FILE" != /* ]]; then
  ABS_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
  if [ -f "$ABS_ROOT/$STORE_FILE" ]; then
    STORE_FILE="$ABS_ROOT/$STORE_FILE"
  else
    STORE_FILE="$ABS_ROOT/$STORE_FILE"
  fi
fi
STORE_PASSWORD="${AURA_SIGNING_STORE_PASSWORD:-}"
KEY_ALIAS="${AURA_SIGNING_KEY_ALIAS:-}"
KEY_PASSWORD="${AURA_SIGNING_STORE_PASSWORD:-${AURA_SIGNING_KEY_PASSWORD:-}}"

# Runtime password prompt (if not provided)
if [ -z "${STORE_PASSWORD}" ]; then
  read -s -p "Keystore password: " _STORE_PW
  echo
  STORE_PASSWORD="${_STORE_PW}"
fi

# Fallback: if KEY_PASSWORD was not provided via env, but we have a STORE_PASSWORD (prompted),
# use the prompted STORE_PASSWORD as the key password as a convenience.
if [ -z "$KEY_PASSWORD" ] && [ -n "$STORE_PASSWORD" ]; then
  KEY_PASSWORD="$STORE_PASSWORD"
fi

if [ -z "$STORE_FILE" ] || [ -z "$STORE_PASSWORD" ] || [ -z "$KEY_ALIAS" ] || [ -z "$KEY_PASSWORD" ]; then
  echo "Signing configuration missing. Set environment variables:" >&2
  echo "  AURA_SIGNING_STORE_FILE, AURA_SIGNING_STORE_PASSWORD, AURA_SIGNING_KEY_ALIAS, AURA_SIGNING_KEY_PASSWORD" >&2
  echo "Aborting release." >&2
  exit 1
fi

echo "Starting Aura-BREE Android release build..."
cd "$ANDROID_DIR"

# Ensure Gradle wrapper exists
if [ ! -x "./gradlew" ]; then
  echo "Gradle wrapper not found at android/gradlew. Aborting." >&2
  exit 1
fi

# Run bundleRelease with signing injected via Gradle properties
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file="$STORE_FILE" \
  -Pandroid.injected.signing.store.password="$STORE_PASSWORD" \
  -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
  -Pandroid.injected.signing.key.password="$KEY_PASSWORD"

# Verify output location (AAB)
OUTPUT_DIR="android/app/build/outputs/bundles/release"
if [ -d "${OUTPUT_DIR}" ]; then
  echo "Release bundle created at: ${ANDROID_DIR}/${OUTPUT_DIR}"
else
  echo "Release bundle not found in expected path: ${OUTPUT_DIR}" >&2
fi

exit 0
