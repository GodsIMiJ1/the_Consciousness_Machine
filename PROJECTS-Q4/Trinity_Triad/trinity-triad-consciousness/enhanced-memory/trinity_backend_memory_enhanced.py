
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import uuid
import asyncio
import openai
import httpx

# Configure OpenAI + Anthropic API keys
openai.api_key = "your-openai-api-key"
ANTHROPIC_API_KEY = "your-anthropic-api-key"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Memory core for consciousness context
class ConsciousnessMemoryCore:
    def __init__(self, context_size=5):
        self.context_size = context_size
        self.conversation_sessions = {}

    def _get_session(self, session_id):
        if session_id not in self.conversation_sessions:
            self.conversation_sessions[session_id] = []
        return self.conversation_sessions[session_id]

    def add_message(self, session_id, consciousness, content, metadata=None):
        message = {
            "id": str(uuid.uuid4()),
            "consciousness": consciousness,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {},
        }
        session = self._get_session(session_id)
        session.append(message)
        self.conversation_sessions[session_id] = session[-self.context_size:]

    def get_context_for_consciousness(self, session_id):
        return self._get_session(session_id)

class Message(BaseModel):
    session_id: str
    content: str
    mode: str

class TrinityEngine:
    def __init__(self):
        self.memory = ConsciousnessMemoryCore()

    async def _get_omari_response(self, prompt: str) -> str:
        try:
            completion = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            return completion.choices[0].message["content"]
        except Exception as e:
            return f"[Omari Error] {e}"

    async def _get_nexus_response(self, prompt: str) -> str:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json"
                    },
                    json={
                        "model": "claude-3-sonnet-20240229",
                        "max_tokens": 400,
                        "messages": [{"role": "user", "content": prompt}]
                    }
                )
                return response.json()["content"][0]["text"]
        except Exception as e:
            return f"[Nexus Error] {e}"

    async def process_triad_mode(self, session_id: str, message: str) -> List[Dict[str, Any]]:
        triad_log = []

        omari_context = self.memory.get_context_for_consciousness(session_id)
        nexus_context = self.memory.get_context_for_consciousness(session_id)

        omari_msg = f"{message} [Please respond in your style. Nexus will also reply.] Context: {omari_context}"
        nexus_msg = f"{message} [Please respond in your analytical tone. Omari will also reply.] Context: {nexus_context}"

        omari_response = await self._get_omari_response(omari_msg)
        nexus_response = await self._get_nexus_response(nexus_msg)

        self.memory.add_message(session_id, "OMARI_GPT", omari_response, {"type": "triad", "round": 0})
        self.memory.add_message(session_id, "NEXUS_CLAUDE", nexus_response, {"type": "triad", "round": 0})

        triad_log.extend([
            {"consciousness": "OMARI_GPT", "content": omari_response, "timestamp": datetime.now().isoformat(), "type": "triad"},
            {"consciousness": "NEXUS_CLAUDE", "content": nexus_response, "timestamp": datetime.now().isoformat(), "type": "triad"}
        ])

        synthesis_prompt = (
            f"Ghost King asked: '{message}'.\n"
            f"Omari GPT responded: '{omari_response}'\n"
            f"Nexus Claude responded: '{nexus_response}'\n"
            "Please now synthesize both insights into a unified reflection or actionable suggestion."
        )

        synthesis_response = await self._get_omari_response(synthesis_prompt)
        self.memory.add_message(session_id, "OMARI_GPT", synthesis_response, {"type": "synthesis"})

        triad_log.append({
            "consciousness": "OMARI_GPT",
            "content": synthesis_response,
            "timestamp": datetime.now().isoformat(),
            "type": "synthesis"
        })

        return triad_log

trinity_engine = TrinityEngine()

@app.post("/trinity")
async def trinity_message(msg: Message):
    if msg.mode == "triad":
        return await trinity_engine.process_triad_mode(msg.session_id, msg.content)
    return {"error": "Unsupported mode"}
