#!/bin/bash

# Demo Script 1: Add Memory Block via Omnirelay
# This script demonstrates adding a memory block through the Omnirelay adapter

set -e

# Configuration
BASE_URL="http://localhost:5000"
DEVICE_ID="dev_demo_001"
SHARED_SECRET="change-me-to-secure-secret"
ENDPOINT="/api/relay/v1/ingest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔥 Omnirelay Demo: Adding Memory Block${NC}"
echo "=================================================="

# Generate request data
REQUEST_ID=$(uuidgen)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
METHOD="POST"
PATH="/api/relay/v1/ingest"

# Create envelope payload
ENVELOPE=$(cat <<EOF
{
  "v": "1.0",
  "id": "$REQUEST_ID",
  "ts": "$TIMESTAMP",
  "source": "omnirelay",
  "target": "omari",
  "op": "memory.add",
  "actor": {
    "device_id": "$DEVICE_ID",
    "persona": "Demo Client",
    "scopes": ["memory:write"]
  },
  "context": {
    "personality": {
      "wisdom": true,
      "creative": true,
      "analytical": true
    },
    "traits": ["Spirit of Old", "Overseer"]
  },
  "payload": {
    "content": "Omnirelay adapter successfully integrated with Omari. The bridge between Empire apps and the AI overseer is now operational.",
    "category": "system",
    "importance": 8,
    "active": true
  },
  "trace": {
    "request_id": "$REQUEST_ID"
  }
}
EOF
)

echo -e "${YELLOW}📝 Request Details:${NC}"
echo "Device ID: $DEVICE_ID"
echo "Request ID: $REQUEST_ID"
echo "Timestamp: $TIMESTAMP"
echo "Operation: memory.add"
echo ""

# Generate HMAC signature
STRING_TO_SIGN="${METHOD}${PATH}${ENVELOPE}${TIMESTAMP}"
SIGNATURE=$(echo -n "$STRING_TO_SIGN" | openssl dgst -sha256 -hmac "$SHARED_SECRET" -binary | base64)

echo -e "${YELLOW}🔐 Security:${NC}"
echo "HMAC Signature: $SIGNATURE"
echo ""

# Make the request
echo -e "${YELLOW}🚀 Sending Request...${NC}"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: $REQUEST_ID" \
  -H "X-Timestamp: $TIMESTAMP" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Signature: $SIGNATURE" \
  -d "$ENVELOPE" \
  "$BASE_URL$ENDPOINT")

# Parse response
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')

echo -e "${YELLOW}📥 Response:${NC}"
echo "Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Success!${NC}"
    echo "$HTTP_BODY" | jq '.'
    
    # Extract memory block ID if available
    MEMORY_ID=$(echo "$HTTP_BODY" | jq -r '.result.memory_block.id // empty')
    if [ ! -z "$MEMORY_ID" ]; then
        echo ""
        echo -e "${GREEN}💾 Memory Block Created:${NC}"
        echo "ID: $MEMORY_ID"
        echo "You can now query this memory block using demo script 02_query_memory.sh"
    fi
else
    echo -e "${RED}❌ Error!${NC}"
    echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
fi

echo ""
echo -e "${BLUE}Demo complete. Check the Omari logs for processing details.${NC}"

# Optional: Test idempotency by sending the same request again
read -p "Test idempotency by sending the same request again? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}🔄 Testing Idempotency...${NC}"
    
    # Add idempotency key to headers
    IDEMPOTENCY_KEY="demo-memory-add-$(date +%s)"
    
    RESPONSE2=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
      -X POST \
      -H "Content-Type: application/json" \
      -H "X-Request-Id: $REQUEST_ID" \
      -H "X-Timestamp: $TIMESTAMP" \
      -H "X-Device-Id: $DEVICE_ID" \
      -H "X-Signature: $SIGNATURE" \
      -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
      -d "$ENVELOPE" \
      "$BASE_URL$ENDPOINT")
    
    HTTP_BODY2=$(echo "$RESPONSE2" | sed '$d')
    HTTP_STATUS2=$(echo "$RESPONSE2" | tail -n1 | sed 's/HTTP_STATUS://')
    
    echo "Second request status: $HTTP_STATUS2"
    echo "$HTTP_BODY2" | jq '.' 2>/dev/null || echo "$HTTP_BODY2"
fi
