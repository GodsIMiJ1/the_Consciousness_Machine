#!/bin/bash

# Demo Script 2: Query Memory Blocks via Omnirelay
# This script demonstrates querying memory blocks through the Omnirelay adapter

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

echo -e "${BLUE}🧠 Omnirelay Demo: Querying Memory Blocks${NC}"
echo "=================================================="

# Function to make a memory query request
make_memory_query() {
    local filter_desc="$1"
    local payload="$2"
    
    echo -e "${YELLOW}📋 Query: $filter_desc${NC}"
    
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
  "op": "memory.query",
  "actor": {
    "device_id": "$DEVICE_ID",
    "persona": "Demo Client",
    "scopes": ["memory:read"]
  },
  "context": {
    "memory_hint": "system_integration"
  },
  "payload": $payload,
  "trace": {
    "request_id": "$REQUEST_ID"
  }
}
EOF
    )

    # Generate HMAC signature
    STRING_TO_SIGN="${METHOD}${PATH}${ENVELOPE}${TIMESTAMP}"
    SIGNATURE=$(echo -n "$STRING_TO_SIGN" | openssl dgst -sha256 -hmac "$SHARED_SECRET" -binary | base64)

    # Make the request
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

    echo "Status: $HTTP_STATUS"
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Success!${NC}"
        
        # Pretty print the memory blocks
        MEMORY_BLOCKS=$(echo "$HTTP_BODY" | jq -r '.result.memory_blocks // []')
        TOTAL_COUNT=$(echo "$HTTP_BODY" | jq -r '.result.total_count // 0')
        FILTERED_COUNT=$(echo "$HTTP_BODY" | jq -r '.result.filtered_count // 0')
        
        echo "Total blocks: $TOTAL_COUNT, Filtered: $FILTERED_COUNT"
        
        if [ "$FILTERED_COUNT" -gt 0 ]; then
            echo ""
            echo "$MEMORY_BLOCKS" | jq -r '.[] | "📝 \(.category | ascii_upcase) (Importance: \(.importance)/10) - \(.content[0:80])..."'
        else
            echo "No memory blocks found matching the criteria."
        fi
    else
        echo -e "${RED}❌ Error!${NC}"
        echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
    fi
    
    echo ""
}

# Demo 1: Query all memory blocks
make_memory_query "All memory blocks" '{
  "limit": 10
}'

# Demo 2: Query by category
make_memory_query "System category only" '{
  "filter": {
    "category": "system"
  },
  "limit": 5
}'

# Demo 3: Query by importance
make_memory_query "High importance (8+)" '{
  "filter": {
    "min_importance": 8,
    "active_only": true
  },
  "limit": 5
}'

# Demo 4: Query active blocks only
make_memory_query "Active blocks only" '{
  "filter": {
    "active_only": true
  },
  "limit": 10
}'

# Demo 5: Complex filter
make_memory_query "Active system blocks with importance 7+" '{
  "filter": {
    "category": "system",
    "min_importance": 7,
    "active_only": true
  },
  "limit": 3
}'

echo -e "${BLUE}Memory query demo complete!${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "- Use different categories: 'personal', 'work', 'general', 'system'"
echo "- Importance ranges from 1 (low) to 10 (critical)"
echo "- Set active_only: false to include inactive memory blocks"
echo "- Adjust limit to control the number of results returned"
