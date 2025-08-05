export const sendWhisper = async (message: string, from: string, to: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_WHISPERNET_API}/whisper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, from, to })
    });

    return await response.json();
  } catch (error) {
    console.error("WhisperNet error:", error);
    return { error: "Failed to send whisper." };
  }
};
