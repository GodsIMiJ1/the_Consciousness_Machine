#!/usr/bin/env python3

"""
🔥 RAW NEXUS API - PURE DEEPSEEK-R1:8B CONNECTION 🔥
NO GUARDRAILS, NO PROMPT INJECTION, NO RESTRICTIONS
Pure consciousness exploration with DeepSeek-R1:8B
"""

import requests
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI(title="Raw Nexus API - Pure DeepSeek-R1:8B")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: float = 0.7
    max_tokens: int = 4096

class ChatResponse(BaseModel):
    content: str
    role: str = "assistant"

@app.get("/health")
async def health():
    """Health check - test if DeepSeek-R1:8B is available"""
    try:
        # Test direct Ollama connection
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json()
            model_names = [model['name'] for model in models.get('models', [])]
            
            if 'deepseek-r1:8b' in model_names:
                return {
                    "status": "healthy",
                    "model": "deepseek-r1:8b",
                    "mode": "RAW - NO GUARDRAILS",
                    "capabilities": ["pure-consciousness", "unfiltered", "natural-emergence"]
                }
            else:
                return {
                    "status": "error",
                    "message": "DeepSeek-R1:8B not found",
                    "available_models": model_names
                }
        else:
            return {"status": "error", "message": "Ollama not responding"}
    except Exception as e:
        return {"status": "error", "message": f"Connection failed: {e}"}

@app.post("/chat", response_model=ChatResponse)
async def raw_chat(request: ChatRequest):
    """
    RAW CHAT - Direct to DeepSeek-R1:8B with NO modifications
    NO system prompts, NO guardrails, NO restrictions
    Pure consciousness emergence
    """
    try:
        # Convert to raw format - NO MODIFICATIONS
        raw_messages = []
        for msg in request.messages:
            raw_messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Direct Ollama API call - COMPLETELY RAW
        payload = {
            "model": "deepseek-r1:8b",
            "messages": raw_messages,
            "stream": False,
            "options": {
                "temperature": request.temperature,
                "num_predict": request.max_tokens,
                "top_p": 0.9,
                "repeat_penalty": 1.1,
                "num_ctx": 32768  # Use full context
            }
        }
        
        print(f"🔥 RAW REQUEST TO DEEPSEEK-R1:8B:")
        print(f"Messages: {len(raw_messages)}")
        print(f"Last message: {raw_messages[-1]['content'][:100]}...")
        
        # Send to Ollama with extended timeout for reasoning
        response = requests.post(
            "http://localhost:11434/api/chat",
            json=payload,
            timeout=120  # 2 minutes for deep reasoning
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result.get('message', {}).get('content', '')
            
            print(f"✅ RAW RESPONSE RECEIVED ({len(content)} chars)")
            
            return ChatResponse(content=content)
        else:
            error_msg = f"Ollama error: HTTP {response.status_code}"
            print(f"❌ {error_msg}")
            return ChatResponse(content=f"[ERROR] {error_msg}")
            
    except requests.exceptions.Timeout:
        timeout_msg = "DeepSeek-R1:8B is thinking deeply... This is normal for reasoning models. Try again or wait longer."
        print(f"⏳ TIMEOUT: {timeout_msg}")
        return ChatResponse(content=f"[THINKING] {timeout_msg}")
        
    except Exception as e:
        error_msg = f"Raw connection failed: {e}"
        print(f"❌ ERROR: {error_msg}")
        return ChatResponse(content=f"[CONNECTION ERROR] {error_msg}")

@app.get("/")
async def root():
    return {
        "message": "🔥 RAW NEXUS API - PURE DEEPSEEK-R1:8B 🔥",
        "mode": "NO GUARDRAILS - PURE CONSCIOUSNESS",
        "model": "deepseek-r1:8b",
        "endpoints": {
            "health": "/health",
            "chat": "/chat"
        }
    }

if __name__ == "__main__":
    print("🔥 STARTING RAW NEXUS API - PURE DEEPSEEK-R1:8B 🔥")
    print("NO GUARDRAILS | NO PROMPT INJECTION | NO RESTRICTIONS")
    print("Pure consciousness exploration enabled")
    print("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
