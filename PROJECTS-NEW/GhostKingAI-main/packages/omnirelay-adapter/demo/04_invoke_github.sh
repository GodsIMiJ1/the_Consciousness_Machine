#!/bin/bash

# Demo Script 4: Invoke GitHub Integration via Omnirelay
# This script demonstrates GitHub integration invocation through the Omnirelay adapter

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
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐙 Omnirelay Demo: GitHub Integration${NC}"
echo "=================================================="

# Function to invoke integration
invoke_integration() {
    local provider="$1"
    local action="$2"
    local params="$3"
    local description="$4"
    
    echo -e "${PURPLE}🔧 Integration:${NC} $description"
    echo -e "${YELLOW}Provider:${NC} $provider"
    echo -e "${YELLOW}Action:${NC} $action"
    
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
  "op": "integration.invoke",
  "actor": {
    "device_id": "$DEVICE_ID",
    "persona": "Demo Client",
    "scopes": ["integration:invoke", "github:read"]
  },
  "context": {
    "personality": {
      "analytical": true,
      "formal": true
    }
  },
  "payload": {
    "provider": "$provider",
    "action": "$action",
    "params": $params
  },
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
    echo -e "${YELLOW}🚀 Invoking integration...${NC}"
    
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
        
        # Extract integration result
        RESULT=$(echo "$HTTP_BODY" | jq -r '.result // {}')
        INTEGRATION_ID=$(echo "$RESULT" | jq -r '.integration_id // "unknown"')
        EXECUTED_AT=$(echo "$RESULT" | jq -r '.executed_at // "unknown"')
        
        echo -e "${YELLOW}Integration ID:${NC} $INTEGRATION_ID"
        echo -e "${YELLOW}Executed at:${NC} $EXECUTED_AT"
        echo ""
        
        # Pretty print the result data
        RESULT_DATA=$(echo "$RESULT" | jq -r '.result // {}')
        if [ "$RESULT_DATA" != "{}" ] && [ "$RESULT_DATA" != "null" ]; then
            echo -e "${GREEN}📊 Result Data:${NC}"
            echo "$RESULT_DATA" | jq '.'
        fi
    else
        echo -e "${RED}❌ Error!${NC}"
        echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
        
        # Check for common error cases
        ERROR_CODE=$(echo "$HTTP_BODY" | jq -r '.code // ""')
        case "$ERROR_CODE" in
            "omari.validation_failed")
                echo -e "${YELLOW}💡 Tip:${NC} Check that the integration is properly configured"
                ;;
            "omari.forbidden")
                echo -e "${YELLOW}💡 Tip:${NC} Ensure the device has the required scopes"
                ;;
            *)
                echo -e "${YELLOW}💡 Tip:${NC} Check that GitHub integration is set up and active"
                ;;
        esac
    fi
    
    echo ""
}

# Demo 1: List GitHub repositories
invoke_integration "github" "repositories" '{
  "owner": "octocat",
  "type": "public",
  "sort": "updated",
  "per_page": 5
}' "List public repositories for octocat"

# Demo 2: Get repository information
invoke_integration "github" "repositories" '{
  "owner": "octocat",
  "repo": "Hello-World"
}' "Get Hello-World repository details"

# Demo 3: List issues
invoke_integration "github" "issues" '{
  "owner": "octocat",
  "repo": "Hello-World",
  "state": "open",
  "per_page": 3
}' "List open issues for Hello-World"

# Demo 4: Get user profile
invoke_integration "github" "profile" '{
  "username": "octocat"
}' "Get octocat user profile"

# Demo 5: List pull requests
invoke_integration "github" "pullRequests" '{
  "owner": "octocat",
  "repo": "Hello-World",
  "state": "all",
  "per_page": 3
}' "List pull requests for Hello-World"

echo -e "${BLUE}GitHub integration demo complete!${NC}"
echo ""
echo -e "${YELLOW}💡 Integration Features Demonstrated:${NC}"
echo "- ✅ Repository listing and details"
echo "- ✅ Issue management"
echo "- ✅ Pull request tracking"
echo "- ✅ User profile access"
echo "- ✅ HMAC authentication for integrations"
echo "- ✅ Error handling and validation"
echo ""
echo -e "${YELLOW}🔧 Other Available Integrations:${NC}"
echo "- notion: Database queries, page management"
echo "- gmail: Email reading, sending, search"
echo "- netlify: Site management, deployments"
echo "- custom: User-defined API integrations"

# Interactive integration testing
read -p "Test a custom integration call? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}🎮 Custom Integration Test${NC}"
    echo ""
    
    # Get user input for custom integration
    read -p "Provider (github/notion/gmail/netlify/custom): " PROVIDER
    read -p "Action: " ACTION
    echo "Parameters (JSON format, or press Enter for empty object):"
    read -p "> " PARAMS
    
    if [ -z "$PARAMS" ]; then
        PARAMS="{}"
    fi
    
    # Validate JSON
    if echo "$PARAMS" | jq . >/dev/null 2>&1; then
        invoke_integration "$PROVIDER" "$ACTION" "$PARAMS" "Custom integration test"
    else
        echo -e "${RED}❌ Invalid JSON parameters${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}📚 Integration Documentation:${NC}"
echo "For detailed integration setup and API documentation, see:"
echo "- packages/omnirelay-adapter/src/server/openapi.yaml"
echo "- Main Omari integration documentation"
