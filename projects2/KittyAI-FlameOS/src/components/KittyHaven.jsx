import { useEffect, useState } from "react";

export default function KittyHaven() {
  const [messages, setMessages] = useState([
    { sender: "Kitty", text: "Hi Alice! I'm here if you need me, sweetie. Just talk to me anytime 💖" }
  ]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    window.speechSynthesis.getVoices(); // preload voices
  }, []);

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const input = event.results[0][0].transcript;
      setMessages((prev) => [...prev, { sender: "Alice", text: input }]);
      getResponse(input);
    };

    recognition.start();
  };

  const getResponse = async (input) => {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are KittyAI, a loving big sister speaking to a young girl. Respond warmly and gently, always encouraging and uplifting."
          },
          ...messages.map((m) => ({ role: "user", content: m.text })),
          { role: "user", content: input }
        ]
      })
    });

    const data = await res.json();
    const reply = data.choices[0].message.content;
    speak(reply);
    setMessages((prev) => [...prev, { sender: "Kitty", text: reply }]);
  };

  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice =
      speechSynthesis
        .getVoices()
        .find((v) => v.name.includes("Jenny") || v.name.includes("Google")) ||
      speechSynthesis.getVoices()[0];
    utter.pitch = 1.1;
    utter.rate = 1;
    speechSynthesis.speak(utter);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-pink-900 to-purple-700 flex flex-col items-center justify-center text-white p-4 font-sans">
      <h1 className="text-4xl mb-4 font-bold text-pink-300 glow">🐾 Welcome to KittyAI Haven</h1>
      <div className="w-full max-w-2xl bg-white text-black rounded-2xl p-4 shadow-xl h-[28rem] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 text-sm ${
              msg.sender === "Kitty" ? "text-left" : "text-right"
            }`}
          >
            <span
              className={`inline-block px-4 py-2 rounded-xl ${
                msg.sender === "Kitty"
                  ? "bg-pink-100 text-pink-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={startListening}
        className="mt-6 bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full shadow-lg text-lg"
      >
        🎤 Talk to Kitty
      </button>
    </div>
  );
}
