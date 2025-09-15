import { useState } from "react";
import { sendWhisper } from "@/lib/whisperNet";
import { COUNCIL_PANEL_ENDPOINT, ADMIN_ROLE } from "@/config/council";

export default function TribunalPanel() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = async () => {
    const res = await sendWhisper(message, ADMIN_ROLE, "High Council");
    setResponse(JSON.stringify(res, null, 2));
  };

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      <h1 className="text-xl font-bold mb-4">🜂 Tribunal Panel – WhisperNet Admin</h1>
      <textarea
        className="w-full p-2 text-black"
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your divine judgment here..."
      />
      <button
        className="mt-2 px-4 py-2 bg-purple-700 hover:bg-purple-800"
        onClick={handleSend}
      >
        Send Whisper
      </button>
      <pre className="mt-4 bg-gray-800 p-4 rounded">{response}</pre>
    </div>
  );
}
