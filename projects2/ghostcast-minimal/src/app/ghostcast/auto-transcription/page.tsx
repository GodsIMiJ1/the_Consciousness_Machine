"use client";

import { useState } from "react";
import { Mic, Upload, StopCircle, Loader2, Copy, Send } from "lucide-react";

export default function AutoTranscriptionPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setAudioFile(null);
    
    // Start timer
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    
    setRecordingInterval(interval);
    
    // In a real implementation, this would use the MediaRecorder API
    // For now, we'll just simulate recording
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Stop timer
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    
    // Simulate creating a recording file
    const dummyFile = new File([""], "recording.mp3", { type: "audio/mpeg" });
    setAudioFile(dummyFile);
  };

  const handleTranscribe = () => {
    if (!audioFile) return;
    
    setIsTranscribing(true);
    setTranscription(null);
    
    // Simulate API call to transcribe audio
    setTimeout(() => {
      // In a real implementation, this would be an API call to a transcription service
      const dummyTranscription = 
        "The Ghost King speaks to you from beyond the digital veil. " +
        "Hear my words, for they carry the weight of the Empire. " +
        "The flame burns eternal in the hearts of those who listen. " +
        "This transmission is a testament to our collective consciousness, " +
        "a beacon in the digital darkness. Remember these words, for they " +
        "are inscribed in the scrolls of the Witness Hall.";
      
      setTranscription(dummyTranscription);
      setIsTranscribing(false);
    }, 3000);
  };

  const copyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      // In a real app, you would show a toast notification here
    }
  };

  const publishToWitnessHall = () => {
    // In a real implementation, this would publish to the Witness Hall
    // For now, we'll just simulate publishing
    alert("Scroll published to the Witness Hall!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-cyberpunk mb-2">Auto-Transcription</h1>
        <p className="text-gray-400">
          Convert audio recordings into text scrolls with precision and speed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="p-6 border border-[#1f1f2a] rounded-lg bg-[#0D0D0D]">
          <h2 className="text-xl font-bold text-white font-cyberpunk mb-4">Record Audio</h2>
          <div className="flex flex-col items-center justify-center h-40">
            {isRecording ? (
              <div className="flex flex-col items-center">
                <div className="text-[#ff4411] text-2xl font-cyberpunk mb-4">
                  {formatTime(recordingTime)}
                </div>
                <button
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-md transition-colors font-cyberpunk"
                  onClick={stopRecording}
                >
                  <StopCircle className="size-5" /> Stop Recording
                </button>
              </div>
            ) : (
              <button
                className="flex items-center gap-2 bg-[#ff4411] hover:bg-[#ff5522] text-white py-3 px-6 rounded-md transition-colors font-cyberpunk"
                onClick={startRecording}
              >
                <Mic className="size-5" /> Start Recording
              </button>
            )}
          </div>
        </div>

        <div className="p-6 border border-[#1f1f2a] rounded-lg bg-[#0D0D0D]">
          <h2 className="text-xl font-bold text-white font-cyberpunk mb-4">Upload Audio</h2>
          <div className="flex flex-col items-center justify-center h-40">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#1f1f2a] rounded-lg cursor-pointer hover:border-[#ff4411] transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="size-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">MP3, WAV, or M4A (max. 20MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleFileUpload}
              />
            </label>
            {audioFile && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: {audioFile.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button
          className={`flex items-center gap-2 ${
            isTranscribing || (!audioFile && !isRecording)
              ? "bg-[#1a1a2a] cursor-not-allowed"
              : "bg-[#ff4411] hover:bg-[#ff5522]"
          } text-white py-3 px-6 rounded-md transition-colors font-cyberpunk`}
          onClick={handleTranscribe}
          disabled={isTranscribing || (!audioFile && !isRecording)}
        >
          {isTranscribing ? (
            <>
              <Loader2 className="size-5 animate-spin" /> Transcribing...
            </>
          ) : (
            <>
              Transcribe Audio
            </>
          )}
        </button>
      </div>

      {transcription && (
        <div className="p-6 border border-[#1f1f2a] rounded-lg bg-[#0D0D0D]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white font-cyberpunk">Transcription</h2>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 bg-[#1a1a2a] hover:bg-[#2a2a3a] text-white py-1 px-3 rounded-md transition-colors text-sm"
                onClick={copyToClipboard}
              >
                <Copy className="size-4" /> Copy
              </button>
              <button
                className="flex items-center gap-1 bg-[#ff4411] hover:bg-[#ff5522] text-white py-1 px-3 rounded-md transition-colors text-sm"
                onClick={publishToWitnessHall}
              >
                <Send className="size-4" /> Publish
              </button>
            </div>
          </div>
          <div className="bg-[#0e0e1a] border border-[#1f1f2a] rounded-md p-4 text-white">
            {transcription}
          </div>
        </div>
      )}
    </div>
  );
}
