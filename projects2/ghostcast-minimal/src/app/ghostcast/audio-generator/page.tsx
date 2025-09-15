"use client";

import { useState } from "react";
import { Loader2, Play, Download } from "lucide-react";

export default function AudioGeneratorPage() {
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("ghost_king");

  const voices = [
    { id: "ghost_king", name: "Ghost King", description: "Deep, authoritative voice of the Empire" },
    { id: "oracle", name: "Oracle", description: "Mystical, ethereal female voice" },
    { id: "sentinel", name: "Sentinel", description: "Precise, analytical male voice" },
    { id: "custom", name: "Custom Voice", description: "Upload your own voice sample" },
  ];

  const handleGenerate = async () => {
    if (!script.trim()) return;

    setIsGenerating(true);
    setAudioUrl(null);

    // Simulate API call to generate audio
    setTimeout(() => {
      // In a real implementation, this would be an API call to a TTS service
      // For now, we'll just use a sample audio file
      setAudioUrl("/sample-audio.mp3");
      setIsGenerating(false);
    }, 3000);
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = "ghostcast-broadcast.mp3";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-cyberpunk mb-2">Audio Generator</h1>
        <p className="text-gray-400">
          Transform your scripts into powerful audio broadcasts with AI voice synthesis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <label className="block text-white font-cyberpunk mb-2">Script</label>
          <textarea
            className="w-full h-64 bg-[#0D0D0D] border border-[#1f1f2a] rounded-md p-4 text-white focus:border-[#ff4411] focus:ring-[#ff4411] focus:outline-none"
            placeholder="Enter your broadcast script here..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-white font-cyberpunk mb-2">Voice Selection</label>
          <div className="space-y-4">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className={`p-4 border ${
                  selectedVoice === voice.id
                    ? "border-[#ff4411] bg-[#1a1a2a]"
                    : "border-[#1f1f2a] bg-[#0D0D0D]"
                } rounded-md cursor-pointer hover:border-[#ff4411] transition-colors`}
                onClick={() => setSelectedVoice(voice.id)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-cyberpunk">{voice.name}</h3>
                  {selectedVoice === voice.id && (
                    <div className="size-4 rounded-full bg-[#ff4411]"></div>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-1">{voice.description}</p>
              </div>
            ))}
          </div>
          {selectedVoice === "custom" && (
            <div className="mt-4">
              <label className="block text-white font-cyberpunk mb-2">Upload Voice Sample</label>
              <input
                type="file"
                accept="audio/*"
                className="w-full bg-[#0D0D0D] border border-[#1f1f2a] rounded-md p-2 text-white"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          className={`flex items-center gap-2 ${
            isGenerating
              ? "bg-[#1a1a2a] cursor-not-allowed"
              : "bg-[#ff4411] hover:bg-[#ff5522]"
          } text-white py-3 px-6 rounded-md transition-colors font-cyberpunk`}
          onClick={handleGenerate}
          disabled={isGenerating || !script.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-5 animate-spin" /> Summoning Voice...
            </>
          ) : (
            <>
              <Play className="size-5" /> Summon Voice
            </>
          )}
        </button>

        {audioUrl && (
          <button
            className="flex items-center gap-2 bg-[#0D0D0D] border border-[#1f1f2a] text-white py-3 px-6 rounded-md hover:bg-[#1a1a2a] transition-colors font-cyberpunk"
            onClick={handleDownload}
          >
            <Download className="size-5" /> Download MP3
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="mt-8 p-6 border border-[#1f1f2a] rounded-lg bg-[#0D0D0D]">
          <h2 className="text-xl font-bold text-white font-cyberpunk mb-4">Generated Audio</h2>
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}
