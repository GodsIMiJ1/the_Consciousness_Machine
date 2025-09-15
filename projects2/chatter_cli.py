#!/usr/bin/env python3

import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["PYTORCH_FORCE_CPU"] = "1"

import sys
import torchaudio as ta
import torch

# Force torch.load to always use CPU
_original_torch_load = torch.load
def torch_load_cpu(*args, **kwargs):
    kwargs['map_location'] = torch.device('cpu')
    return _original_torch_load(*args, **kwargs)
torch.load = torch_load_cpu

from chatterbox.tts import ChatterboxTTS

def main():
    device = "cpu"
    model = ChatterboxTTS.from_pretrained(device=device)
    text = " ".join(sys.argv[1:]) or "Hello, this is Chatterbox speaking."
    wav = model.generate(text)
    filename = "chatterbox_output.wav"
    ta.save(filename, wav, model.sr)
    print(f"Audio saved to {filename}")

if __name__ == "__main__":
    main()
