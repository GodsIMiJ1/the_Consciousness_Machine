"use client";

import { useState } from "react";
import { Loader2, Upload, Check, X } from "lucide-react";

export default function ScrollCasterPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("witness-hall");

  const destinations = [
    { id: "witness-hall", name: "Witness Hall", url: "https://the-witness-hall.netlify.app/voluntary-flame" },
    { id: "ghost-tribunal", name: "Ghost Tribunal", url: "https://the-witness-hall.netlify.app/sacred-declarations" },
    { id: "empire-voice", name: "Voice of the Empire", url: "https://the-witness-hall.netlify.app/prophetic-music" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handlePublish = () => {
    if (!title.trim() || !audioFile) return;

    setIsPublishing(true);
    setPublishSuccess(false);

    // Simulate API call to publish
    setTimeout(() => {
      // In a real implementation, this would be an API call to publish to the selected destination
      setIsPublishing(false);
      setPublishSuccess(true);

      // Reset form after successful publish
      setTimeout(() => {
        setPublishSuccess(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-cyberpunk mb-2">ScrollCaster</h1>
        <p className="text-gray-400">
          Publish your broadcasts to the Empire's platforms with a single command.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <label className="block text-white font-cyberpunk mb-2">Title</label>
            <input
              type="text"
              className="w-full bg-[#0D0D0D] border border-[#1f1f2a] rounded-md p-3 text-white focus:border-[#ff4411] focus:ring-[#ff4411] focus:outline-none"
              placeholder="Enter broadcast title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-white font-cyberpunk mb-2">Description</label>
            <textarea
              className="w-full h-24 bg-[#0D0D0D] border border-[#1f1f2a] rounded-md p-3 text-white focus:border-[#ff4411] focus:ring-[#ff4411] focus:outline-none"
              placeholder="Enter broadcast description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-white font-cyberpunk mb-2">Audio File</label>
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#1f1f2a] rounded-lg cursor-pointer hover:border-[#ff4411] transition-colors">
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

          <div>
            <label className="block text-white font-cyberpunk mb-2">Transcription (Optional)</label>
            <textarea
              className="w-full h-32 bg-[#0D0D0D] border border-[#1f1f2a] rounded-md p-3 text-white focus:border-[#ff4411] focus:ring-[#ff4411] focus:outline-none"
              placeholder="Enter or paste transcription..."
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-white font-cyberpunk mb-2">Tags</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 bg-[#0D0D0D] border border-[#1f1f2a] rounded-md p-3 text-white focus:border-[#ff4411] focus:ring-[#ff4411] focus:outline-none"
                placeholder="Add tags..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="ml-2 bg-[#1a1a2a] hover:bg-[#2a2a3a] text-white py-3 px-4 rounded-md transition-colors"
                onClick={addTag}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center bg-[#1a1a2a] text-white px-3 py-1 rounded-full"
                >
                  {tag}
                  <button
                    className="ml-2 text-gray-400 hover:text-white"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white font-cyberpunk mb-2">Destination</label>
            <div className="space-y-3">
              {destinations.map((destination) => (
                <div
                  key={destination.id}
                  className={`p-4 border ${
                    selectedDestination === destination.id
                      ? "border-[#ff4411] bg-[#1a1a2a]"
                      : "border-[#1f1f2a] bg-[#0D0D0D]"
                  } rounded-md cursor-pointer hover:border-[#ff4411] transition-colors`}
                  onClick={() => setSelectedDestination(destination.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-cyberpunk">{destination.name}</h3>
                    {selectedDestination === destination.id && (
                      <div className="size-4 rounded-full bg-[#ff4411]"></div>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1 truncate">
                    {destination.url}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border border-[#1f1f2a] rounded-lg bg-[#0D0D0D]">
            <h3 className="text-white font-cyberpunk mb-2">NODE Seal</h3>
            <p className="text-gray-400 text-sm">
              Your broadcast will be sealed with the NODE signature and authenticated by the Empire.
            </p>
            <div className="mt-4 flex items-center text-[#ff4411] text-sm">
              <div className="size-3 rounded-full bg-[#ff4411] mr-2"></div>
              NODE-0001 | Ghost King
            </div>
          </div>

          <button
            className={`w-full flex items-center justify-center gap-2 ${
              isPublishing || !title.trim() || !audioFile
                ? "bg-[#1a1a2a] cursor-not-allowed"
                : "bg-[#ff4411] hover:bg-[#ff5522]"
            } text-white py-3 px-6 rounded-md transition-colors font-cyberpunk`}
            onClick={handlePublish}
            disabled={isPublishing || !title.trim() || !audioFile}
          >
            {isPublishing ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Publishing...
              </>
            ) : publishSuccess ? (
              <>
                <Check className="size-5" /> Published!
              </>
            ) : (
              <>Cast to {destinations.find(d => d.id === selectedDestination)?.name}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
