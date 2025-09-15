#!/usr/bin/env bash
set -euo pipefail

# Secure wrapper: read signing config from .env.release and run non-interactive release-aura.sh
ENV_FILE="${ENV_FILE:-.env.release}"

# Load env from file if present
if [ -f "$ENV_FILE" ]; then
  echo "Loading signing env from ${ENV_FILE}"
  # Source the file to export variables
  set -a
  # Ignore comments and empty lines
  grep -Eq '^[^#\t ]' "$ENV_FILE" && . "$ENV_FILE" || true
  set +a
fi

# Validate required variables
REQUIRED=(AURA_SIGNING_STORE_FILE AURA_SIGNING_STORE_PASSWORD AURA_SIGNING_KEY_ALIAS AURA_SIGNING_KEY_PASSWORD)
MISSING=0
for V in "${REQUIRED[@]}"; do
  if [ -z "${!V:-}" ]; then
    echo "Missing env: ${V}"
    MISSING=1
  fi
done

if [ "$MISSING" -eq 1 ]; then
  echo "Cannot proceed with non-interactive release. Please ensure values exist in ${ENV_FILE} or as environment variables."
  echo "Required: AURA_SIGNING_STORE_FILE, AURA_SIGNING_STORE_PASSWORD, AURA_SIGNING_KEY_ALIAS, AURA_SIGNING_KEY_PASSWORD"
  exit 1
fi

echo "Launching non-interactive release using ${ENV_FILE}..."
# Re-export variables explicitly for the release script
AURA_SIGNING_STORE_FILE="${AURA_SIGNING_STORE_FILE}"
AURA_SIGNING_STORE_PASSWORD="${AURA_SIGNING_STORE_PASSWORD}"
AURA_SIGNING_KEY_ALIAS="${AURA_SIGNING_KEY_ALIAS}"
AURA_SIGNING_KEY_PASSWORD="${AURA_SIGNING_KEY_PASSWORD}"

# Run the release script non-interactively
bash -c "AURA_SIGNING_STORE_FILE='$AURA_SIGNING_STORE_FILE' AURA_SIGNING_STORE_PASSWORD='$AURA_SIGNING_STORE_PASSWORD' AURA_SIGNING_KEY_ALIAS='$AURA_SIGNING_KEY_ALIAS' AURA_SIGNING_KEY_PASSWORD='$AURA_SIGNING_KEY_PASSWORD' bash scripts/release-aura.sh"
