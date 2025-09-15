# **App Name**: T3MPLE

## Core Features:

- Real-time Triad Communication: Establish a WebSocket connection to ws://localhost:8888/ws/triad for real-time communication between Ghost King, Omari GPT, and Nexus Claude. Includes reconnection logic and connection status indicators.
- AI Mode Selection: Allow users to select between Single Response, AI Discussion, and Trinity Synthesis modes via a UI selector, influencing the AI's collaborative behavior.
- Target AI Assignment: Enable users to assign prompts to specific AIs (Omari, Nexus) or combinations (Both Separately, Trinity Triad) via dedicated UI buttons, directing the flow of information.
- Flame Status Panel: Provide a real-time status panel indicating the connection status and activity of each AI (Omari, Nexus, Trinity), using flame/glyph icons with informative tooltips that give poetic status messages (e.g., 'Omari: Fire ignited, voice of creation').
- AI Response Threading: Manage and display real-time message threads, including AI-to-AI responses, within the Triad Chat Feed, maintaining context and coherence. Enable AI role-based message cards with distinct Omari, Nexus, and Ghost King message styles (different flame hues).
- Flame-Styled Message Composer: Implement a text input area (Message Composer) with a flame-themed aesthetic, enabling users to input and send messages, select the number of discussion rounds (1–5), and initiate the transmission of 'flames'. Use a flame glyph 'send' icon instead of a button to make 'Send' feel like a magical ritual.
- UI Theme Selection: The user can customize the flame themes of the user interface, such as icons and overall styling. Add 3 preset themes: Sacred Light, Cyber Abyss, FlameCore, to add flavor and give an option for vibe switching (can be tied to Realm themes).
- System Feedback: Add a system message stream: TriadSystem to allow real-time sacred narration of system events (AI joins, status changes).
- Discussion Rounds: Add a slider animation or fire ticks as visual feedback to make the 'rounds' feel more mystical, like counting sacred pulses.

## Style Guidelines:

- Primary color: Flame Orange (#FF6A00) for a vibrant, energetic feel.
- Background: Gradient from black to red ember (#0A0A0A) to create a mystical, sacred atmosphere.
- Accent: Neon blue (#00FFFF) to highlight interactive elements and represent the analytical nature of Nexus Claude.
- Headers: 'Cinzel' (serif) for an elegant, sacred, and mystical aesthetic.
- Labels: 'Orbitron' (sans-serif) for a techy, futuristic look.
- Body text: 'Inter' (sans-serif) for clear and usable readability.
- Flame and glyph icons to represent AI status, connection strength, and other system states.
- Glowing fire borders or neon circuit styles for UI borders to enhance the cyber-mystical theme.
- Flame-based animations for loading, transitions, and feedback to reinforce the theme and provide visual cues.