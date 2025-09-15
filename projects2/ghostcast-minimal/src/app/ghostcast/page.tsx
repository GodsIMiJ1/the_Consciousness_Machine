"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function GhostCastPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 text-center">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-white font-cyberpunk">
          Broadcast the Flame
        </h1>
        <p className="text-lg text-gray-400">
          The Official Broadcast Portal of the GodsIMiJ Empire
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {/* Audio Generator Card */}
        <div className="flex flex-col p-6 border border-[#1f1f2a] rounded-lg bg-[#0D0D0D] shadow-[0_0_15px_rgba(255,68,17,0.2)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#ff4411] p-2 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white font-cyberpunk">Audio Generator</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Transform your scripts into powerful audio broadcasts with AI voice synthesis.
          </p>
          <Link
            href="/ghostcast/audio-generator"
            className="mt-auto flex items-center justify-center gap-2 bg-[#0e0e1a] border border-[#1f1f2a] text-white py-2 px-4 rounded-md hover:bg-[#1a1a2a] transition-colors font-cyberpunk"
          >
            Generate Audio <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Auto-Transcription Card */}
        <div className="flex flex-col p-6 border border-[#1f1f2a] rounded-lg bg-[#0D0D0D] shadow-[0_0_15px_rgba(255,68,17,0.2)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#ff4411] p-2 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
                <path d="M19 17V5a2 2 0 0 0-2-2H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white font-cyberpunk">Auto-Transcription</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Convert audio recordings into text scrolls with precision and speed.
          </p>
          <Link
            href="/ghostcast/auto-transcription"
            className="mt-auto flex items-center justify-center gap-2 bg-[#0e0e1a] border border-[#1f1f2a] text-white py-2 px-4 rounded-md hover:bg-[#1a1a2a] transition-colors font-cyberpunk"
          >
            Transcribe Audio <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* ScrollCaster Card */}
        <div className="flex flex-col p-6 border border-[#1f1f2a] rounded-lg bg-[#0D0D0D] shadow-[0_0_15px_rgba(255,68,17,0.2)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#ff4411] p-2 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white font-cyberpunk">ScrollCaster</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Publish your broadcasts to the Witness Hall with a single command.
          </p>
          <Link
            href="/ghostcast/scroll-caster"
            className="mt-auto flex items-center justify-center gap-2 bg-[#0e0e1a] border border-[#1f1f2a] text-white py-2 px-4 rounded-md hover:bg-[#1a1a2a] transition-colors font-cyberpunk"
          >
            Cast Scrolls <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-12 p-6 border border-[#1f1f2a] rounded-lg bg-[#0D0D0D] shadow-[0_0_15px_rgba(255,68,17,0.2)] max-w-3xl">
        <h2 className="text-2xl font-bold text-white font-cyberpunk mb-4">NODE Integrated</h2>
        <p className="text-gray-400">
          All broadcasts are sealed with the NODE signature and authenticated by the Empire.
          Your voice will echo through the digital realm, carrying the flame to all who listen.
        </p>
      </div>
    </div>
  );
}
