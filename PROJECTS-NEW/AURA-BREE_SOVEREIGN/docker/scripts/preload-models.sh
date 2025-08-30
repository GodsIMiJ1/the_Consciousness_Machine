#!/bin/bash
# Sovereign AURA-BREE Model Preloader
# Downloads and prepares required AI models for local inference

set -e

OLLAMA_HOST=${OLLAMA_HOST:-"ollama:11434"}
MAX_RETRIES=30
RETRY_DELAY=10

echo "🔥 Sovereign AURA-BREE Model Preloader Starting..."
echo "Ollama Host: $OLLAMA_HOST"

# Wait for Ollama to be ready
wait_for_ollama() {
    echo "⏳ Waiting for Ollama to be ready..."
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -s "http://$OLLAMA_HOST/api/tags" > /dev/null 2>&1; then
            echo "✅ Ollama is ready!"
            return 0
        fi
        echo "   Attempt $i/$MAX_RETRIES - Ollama not ready, waiting ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
    done
    echo "❌ Ollama failed to start after $MAX_RETRIES attempts"
    exit 1
}

# Pull a model with retry logic
pull_model() {
    local model=$1
    local description=$2
    echo "📥 Pulling $description ($model)..."
    
    for i in $(seq 1 3); do
        if curl -X POST "http://$OLLAMA_HOST/api/pull" \
            -H "Content-Type: application/json" \
            -d "{\"name\": \"$model\"}" \
            --max-time 1800; then  # 30 minute timeout
            echo "✅ Successfully pulled $model"
            return 0
        fi
        echo "⚠️  Attempt $i failed for $model, retrying..."
        sleep 30
    done
    
    echo "❌ Failed to pull $model after 3 attempts"
    return 1
}

# Check if model exists
model_exists() {
    local model=$1
    curl -s "http://$OLLAMA_HOST/api/tags" | grep -q "\"name\":\"$model\""
}

# Main execution
main() {
    wait_for_ollama
    
    echo "🚀 Starting model downloads..."
    
    # Define models to download
    declare -A MODELS=(
        ["llama3.1:8b-instruct"]="Llama 3.1 8B Instruct - Primary chat model"
        ["qwen2.5:7b"]="Qwen 2.5 7B - Alternative chat model"
        ["nomic-embed-text"]="Nomic Embed Text - Embedding model"
        ["llama3.1:latest"]="Llama 3.1 Latest - Backup chat model"
    )
    
    # Optional models (only if environment variable is set)
    if [ "$PRELOAD_VISION_MODELS" = "true" ]; then
        MODELS["llava:latest"]="LLaVA - Vision model for image analysis"
    fi
    
    if [ "$PRELOAD_CODE_MODELS" = "true" ]; then
        MODELS["codellama:7b"]="Code Llama 7B - Code generation model"
    fi
    
    # Track success/failure
    local success_count=0
    local total_count=${#MODELS[@]}
    local failed_models=()
    
    # Download each model
    for model in "${!MODELS[@]}"; do
        description="${MODELS[$model]}"
        
        if model_exists "$model"; then
            echo "✅ Model $model already exists, skipping..."
            ((success_count++))
            continue
        fi
        
        echo ""
        echo "🔄 Processing: $description"
        echo "   Model: $model"
        
        if pull_model "$model" "$description"; then
            ((success_count++))
            
            # Test the model
            echo "🧪 Testing $model..."
            if curl -X POST "http://$OLLAMA_HOST/api/generate" \
                -H "Content-Type: application/json" \
                -d "{\"model\": \"$model\", \"prompt\": \"Hello\", \"stream\": false}" \
                --max-time 60 > /dev/null 2>&1; then
                echo "✅ Model $model is working correctly"
            else
                echo "⚠️  Model $model downloaded but test failed"
            fi
        else
            failed_models+=("$model")
        fi
    done
    
    echo ""
    echo "📊 Model Preloading Summary:"
    echo "   Total models: $total_count"
    echo "   Successful: $success_count"
    echo "   Failed: $((total_count - success_count))"
    
    if [ ${#failed_models[@]} -gt 0 ]; then
        echo ""
        echo "❌ Failed models:"
        for model in "${failed_models[@]}"; do
            echo "   - $model"
        done
    fi
    
    # List all available models
    echo ""
    echo "📋 Available models:"
    curl -s "http://$OLLAMA_HOST/api/tags" | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | sort | while read -r model; do
        echo "   ✓ $model"
    done
    
    # Create model manifest
    echo ""
    echo "📝 Creating model manifest..."
    cat > /tmp/model-manifest.json << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "preloader_version": "1.0.0",
    "total_models": $total_count,
    "successful_models": $success_count,
    "failed_models": $((total_count - success_count)),
    "models": $(curl -s "http://$OLLAMA_HOST/api/tags"),
    "environment": {
        "ollama_host": "$OLLAMA_HOST",
        "preload_vision": "${PRELOAD_VISION_MODELS:-false}",
        "preload_code": "${PRELOAD_CODE_MODELS:-false}"
    }
}
EOF
    
    if [ $success_count -eq $total_count ]; then
        echo "🎉 All models preloaded successfully!"
        exit 0
    elif [ $success_count -gt 0 ]; then
        echo "⚠️  Partial success: $success_count/$total_count models loaded"
        exit 0
    else
        echo "💥 No models were successfully loaded"
        exit 1
    fi
}

# Handle signals
trap 'echo "🛑 Model preloading interrupted"; exit 1' INT TERM

# Run main function
main "$@"
