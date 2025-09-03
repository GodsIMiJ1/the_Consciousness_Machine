#!/bin/bash

# Demo Script 3: Chat with Omari via Omnirelay
# This script demonstrates chat functionality through the Omnirelay adapter

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

echo -e "${BLUE}💬 Omnirelay Demo: Chat with Omari${NC}"
echo "=================================================="

# Function to send a chat message
send_chat_message() {
    local message="$1"
    local conversation_id="$2"
    local tools="$3"
    
    echo -e "${PURPLE}👤 User:${NC} $message"
    
    # Generate request data
    REQUEST_ID=$(uuidgen)
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    METHOD="POST"
    PATH="/api/relay/v1/ingest"

    # Build payload
    local payload="{\"input\": \"$message\""
    if [ ! -z "$conversation_id" ]; then
        payload="$payload, \"conversation_id\": \"$conversation_id\""
    fi
    if [ ! -z "$tools" ]; then
        payload="$payload, \"tools\": $tools"
    fi
    payload="$payload}"

    # Create envelope payload
    ENVELOPE=$(cat <<EOF
{
  "v": "1.0",
  "id": "$REQUEST_ID",
  "ts": "$TIMESTAMP",
  "source": "omnirelay",
  "target": "omari",
  "op": "omari.chat",
  "actor": {
    "device_id": "$DEVICE_ID",
    "persona": "Demo User",
    "scopes": ["chat:send", "conversation:create"]
  },
  "context": {
    "personality": {
      "wisdom": true,
      "humor": false,
      "creative": true,
      "analytical": true,
      "empathetic": true,
      "formal": false
    },
    "traits": ["Spirit of Old", "Overseer"],
    "memory_hint": "omnirelay_integration"
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

    if [ "$HTTP_STATUS" = "200" ]; then
        CHAT_RESPONSE=$(echo "$HTTP_BODY" | jq -r '.result.response // "No response"')
        CONV_ID=$(echo "$HTTP_BODY" | jq -r '.result.conversation_id // ""')
        USAGE=$(echo "$HTTP_BODY" | jq -r '.result.usage // {}')
        
        echo -e "${GREEN}🧙‍♂️ Omari:${NC} $CHAT_RESPONSE"
        
        if [ ! -z "$CONV_ID" ] && [ "$CONV_ID" != "null" ]; then
            echo -e "${YELLOW}📝 Conversation ID:${NC} $CONV_ID"
            # Return conversation ID for next message
            echo "$CONV_ID"
        fi
        
        # Show usage if available
        if [ "$USAGE" != "{}" ] && [ "$USAGE" != "null" ]; then
            TOKENS=$(echo "$USAGE" | jq -r '.total_tokens // "unknown"')
            echo -e "${YELLOW}🔢 Tokens used:${NC} $TOKENS"
        fi
    else
        echo -e "${RED}❌ Chat Error!${NC}"
        echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
        return 1
    fi
    
    echo ""
}

# Demo conversation
echo -e "${YELLOW}Starting demo conversation with Omari...${NC}"
echo ""

# First message - creates new conversation
CONV_ID=$(send_chat_message "Hello Omari! I'm testing the Omnirelay adapter. Can you tell me about your capabilities?" "")

# Second message - continues conversation
if [ ! -z "$CONV_ID" ] && [ "$CONV_ID" != "null" ]; then
    send_chat_message "What integrations do you currently support?" "$CONV_ID"
    
    # Third message - ask about memory
    send_chat_message "Can you help me organize my memory blocks by importance?" "$CONV_ID"
    
    # Fourth message - test personality
    send_chat_message "Show me your wisdom and analytical traits in action by explaining the Empire grid concept." "$CONV_ID"
else
    echo -e "${YELLOW}⚠️ No conversation ID returned, sending standalone messages...${NC}"
    
    send_chat_message "What integrations do you currently support?" ""
    send_chat_message "Can you help me organize my memory blocks?" ""
fi

echo -e "${BLUE}Chat demo complete!${NC}"
echo ""
echo -e "${YELLOW}💡 Chat Features Demonstrated:${NC}"
echo "- ✅ Conversation creation and continuation"
echo "- ✅ Personality context (wisdom, creative, analytical, empathetic)"
echo "- ✅ Memory hints for context"
echo "- ✅ HMAC authentication"
echo "- ✅ Request/response tracking"
echo ""
echo -e "${YELLOW}🔧 Available Tools:${NC}"
echo "You can also specify tools in chat requests:"
echo "- [\"memory\"] - for memory operations"
echo "- [\"integrations\"] - for integration management"
echo "- [\"personality\"] - for personality adjustments"

# Interactive mode option
read -p "Enter interactive chat mode? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}🎮 Interactive Chat Mode${NC}"
    echo "Type 'exit' to quit, 'help' for commands"
    echo ""
    
    INTERACTIVE_CONV_ID=""
    
    while true; do
        read -p "You: " USER_INPUT
        
        case "$USER_INPUT" in
            "exit"|"quit"|"q")
                echo "Goodbye!"
                break
                ;;
            "help"|"h")
                echo "Commands:"
                echo "  exit/quit/q - Exit interactive mode"
                echo "  help/h - Show this help"
                echo "  new - Start new conversation"
                echo "  Just type your message to chat!"
                ;;
            "new")
                INTERACTIVE_CONV_ID=""
                echo "Starting new conversation..."
                ;;
            "")
                continue
                ;;
            *)
                RESULT=$(send_chat_message "$USER_INPUT" "$INTERACTIVE_CONV_ID")
                if [ ! -z "$RESULT" ] && [ "$RESULT" != "null" ]; then
                    INTERACTIVE_CONV_ID="$RESULT"
                fi
                ;;
        esac
    done
fi
