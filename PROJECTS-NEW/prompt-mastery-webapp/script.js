// Interactive prompt optimization
const promptExamples = [
    {
        input: "Write a marketing email for my product",
        output: `**Context & Role**: You are an expert email marketing copywriter with 10+ years of experience in B2B SaaS marketing.

**Task**: Write a compelling marketing email that follows the AIDA framework (Attention, Interest, Desire, Action).

**Audience**: Decision-makers at mid-size companies (50-500 employees) who are looking to improve their team productivity.

**Product Context**: [Insert your product details here]

**Requirements**:
- Subject line with A/B test variant
- Personalized opening that addresses a specific pain point
- Social proof element (testimonial or statistic)
- Clear value proposition in one sentence
- Single, prominent call-to-action
- Maximum 150 words body text

**Tone**: Professional yet conversational, confident but not pushy

**Output Format**: 
1. Subject Line A
2. Subject Line B
3. Email Body
4. Call-to-action button text`
    },
    {
        input: "Help me code a website",
        output: `**Role**: Senior Full-Stack Developer with expertise in modern web technologies

**Project Setup**:
- Technology stack: [Specify: React/Vue/vanilla JS, etc.]
- Target users: [Define your audience]
- Core functionality: [List 3-5 main features]
- Timeline: [Specify deadline/phases]

**Development Approach**:
1. First, create a detailed wireframe/mockup description
2. Set up project structure with best practices
3. Implement responsive design mobile-first
4. Add interactive features with smooth animations
5. Optimize for performance (Core Web Vitals)
6. Include accessibility features (WCAG 2.1 AA)

**Code Requirements**:
- Follow clean code principles
- Include comments explaining complex logic
- Use semantic HTML and modern CSS
- Implement error handling
- Add loading states for better UX

**Deliverables**:
- Complete, functional code
- README with setup instructions
- Comments explaining architecture decisions

**Questions to clarify**: [Ask specific questions about requirements, constraints, or preferences]

Please start by asking any clarifying questions, then proceed with the wireframe.`
    }
];

// Skills Assessment Data
const assessmentQuestions = [
    {
        question: "What's the most effective way to get AI to think through complex problems step-by-step?",
        options: [
            "Ask it to 'think carefully' about the problem",
            "Use chain-of-thought prompting with explicit reasoning steps",
            "Break the problem into multiple separate prompts",
            "Add more context to the initial prompt"
        ],
        correct: 1,
        explanation: "Chain-of-thought prompting explicitly guides the AI through step-by-step reasoning, dramatically improving accuracy on complex problems."
    },
    {
        question: "When should you use few-shot examples in your prompts?",
        options: [
            "Only when the AI doesn't understand your request",
            "For any task that requires specific formatting or style",
            "Never - they confuse the AI",
            "Only for creative writing tasks"
        ],
        correct: 1,
        explanation: "Few-shot examples are powerful for establishing patterns, formats, tone, and quality standards the AI should follow."
    },
    {
        question: "What's the key advantage of role-based prompting?",
        options: [
            "It makes responses longer and more detailed",
            "It taps into the AI's training on specific domain expertise",
            "It prevents the AI from making mistakes",
            "It works faster than regular prompts"
        ],
        correct: 1,
        explanation: "Role-based prompting leverages the AI's training on specific professional contexts, accessing specialized knowledge and communication patterns."
    },
    {
        question: "How do you handle inconsistent AI outputs?",
        options: [
            "Keep trying the same prompt until it works",
            "Use temperature settings and systematic prompt testing",
            "Switch to a different AI model",
            "Add 'be consistent' to your prompt"
        ],
        correct: 1,
        explanation: "Systematic approaches like A/B testing prompts and adjusting temperature settings provide reliable consistency improvements."
    },
    {
        question: "What's context stacking in prompt engineering?",
        options: [
            "Using multiple AI models simultaneously",
            "Layering different types of context to create richer responses",
            "Asking follow-up questions in sequence",
            "Combining multiple prompts into one long prompt"
        ],
        correct: 1,
        explanation: "Context stacking involves strategically layering different contextual elements (role, task, audience, constraints) for optimal results."
    }
];

// Assessment functionality
let currentAssessment = null;
let userAnswers = [];

function startAssessment() {
    currentAssessment = 0;
    userAnswers = [];
    document.getElementById('assessment-result').style.display = 'none';
    renderQuestion();
}

function renderQuestion() {
    const questionsContainer = document.getElementById('assessment-questions');
    if (currentAssessment >= assessmentQuestions.length) {
        showAssessmentResults();
        return;
    }

    const question = assessmentQuestions[currentAssessment];
    questionsContainer.innerHTML = `
        <div class="question-card active">
            <div class="question-text">
                <strong>Question ${currentAssessment + 1} of ${assessmentQuestions.length}:</strong><br>
                ${question.question}
            </div>
            <div class="answer-options">
                ${question.options.map((option, index) => `
                    <div class="answer-option" onclick="selectAnswer(${index})">
                        ${option}
                    </div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 2rem;">
                <button class="demo-btn" onclick="nextQuestion()" id="next-btn" disabled>Next Question</button>
            </div>
        </div>
    `;
}

function selectAnswer(answerIndex) {
    // Remove previous selections
    document.querySelectorAll('.answer-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Mark selected option
    const options = document.querySelectorAll('.answer-option');
    const selected = options[answerIndex];
    if (selected) selected.classList.add('selected');
    
    // Store answer
    userAnswers[currentAssessment] = answerIndex;
    
    // Enable next button
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.disabled = false;
}

function nextQuestion() {
    currentAssessment++;
    renderQuestion();
}

function showAssessmentResults() {
    const questionsContainer = document.getElementById('assessment-questions');
    questionsContainer.innerHTML = '<p style="text-align: center; opacity: 0.8;">Assessment completed! See your results below.</p>';
    
    // Calculate score
    let correctAnswers = 0;
    for (let i = 0; i < userAnswers.length; i++) {
        if (userAnswers[i] === assessmentQuestions[i].correct) {
            correctAnswers++;
        }
    }
    
    const score = Math.round((correctAnswers / assessmentQuestions.length) * 100);
    
    // Determine skill level and recommendation
    let skillLevel, recommendation;
    if (score >= 80) {
        skillLevel = "Advanced";
        recommendation = "You're already quite skilled! This book will help you master the most sophisticated techniques and build systematic approaches to prompt engineering.";
    } else if (score >= 60) {
        skillLevel = "Intermediate";
        recommendation = "You have good fundamentals but could benefit greatly from learning advanced techniques. This book is perfect for taking your skills to the next level.";
    } else {
        skillLevel = "Beginner";
        recommendation = "You're just getting started, and that's great! This book will provide you with a solid foundation and advanced techniques to quickly become proficient.";
    }
    
    // Show results
    const resultDiv = document.getElementById('assessment-result');
    document.getElementById('score').textContent = score + '%';
    document.getElementById('skill-level').textContent = skillLevel;
    document.getElementById('progress-fill').style.width = score + '%';
    document.getElementById('recommendation').textContent = recommendation;
    
    resultDiv.style.display = 'block';
}

function resetAssessment() {
    document.getElementById('assessment-questions').innerHTML = '<p style="text-align: center; opacity: 0.8;">Click "Start Assessment" to begin testing your prompt engineering skills.</p>';
    document.getElementById('assessment-result').style.display = 'none';
    currentAssessment = null;
    userAnswers = [];
}

// AI Chat functionality
const chatResponses = {
    "what is prompt engineering": "Prompt engineering is the art and science of crafting inputs to AI systems to get desired outputs. It involves understanding how language models interpret instructions and structuring your requests to maximize quality, consistency, and usefulness of responses.",
    
    "chain of thought": "Chain-of-thought prompting is a technique where you explicitly ask the AI to break down complex problems into step-by-step reasoning. For example, instead of asking 'What's 15% of 240?', you'd say 'Calculate 15% of 240 step by step: 1) Convert percentage to decimal, 2) Multiply...' This dramatically improves accuracy on complex tasks.",
    
    "few shot learning": "Few-shot learning in prompting means providing a few examples of the desired input-output format before asking for the actual task. For instance, showing 2-3 examples of well-written email subject lines before asking the AI to write new ones. This helps establish patterns and quality standards.",
    
    "role based prompting": "Role-based prompting assigns a specific professional role or expertise to the AI. Instead of just asking for help, you might say 'You are a senior marketing strategist with 10 years experience...' This taps into the AI's training on that specific domain knowledge.",
    
    "context stacking": "Context stacking involves layering multiple types of context (role, audience, constraints, format, etc.) to create rich, detailed responses. It's like building a detailed brief that covers all aspects of what you need.",
    
    "temperature": "Temperature controls randomness in AI responses. Lower temperature (0.1-0.3) gives consistent, focused outputs. Higher temperature (0.7-1.0) gives more creative, varied responses. Most professional tasks work best with low temperature.",
    
    "default": "That's a great question about prompt engineering! The key is to be specific about what you want to learn. You could ask about specific techniques like 'chain-of-thought prompting', 'few-shot learning', 'role-based prompts', or practical applications like 'how to get consistent outputs' or 'debugging prompts that don't work'."
};

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Generate AI response
    setTimeout(() => {
        const response = generateChatResponse(message);
        addMessage(response, 'ai');
    }, 1000);
}

function addMessage(content, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${sender === 'user' ? 'You' : 'AI'}</div>
        <div class="message-content">${content}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateChatResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Find the best matching response
    for (const [key, response] of Object.entries(chatResponses)) {
        if (lowerMessage.includes(key.toLowerCase())) {
            return response;
        }
    }
    
    // Default response
    return chatResponses.default;
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Technique Showcase functionality
function showTechnique(technique) {
    // Update tabs
    document.querySelectorAll('.technique-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.technique-example').forEach(example => {
        example.classList.remove('active');
    });
    document.getElementById(technique).classList.add('active');
}

// Floating Action Menu
let floatingMenuOpen = false;

function toggleFloatingMenu() {
    const options = document.getElementById('floating-options');
    const mainBtn = document.getElementById('floating-main');
    
    floatingMenuOpen = !floatingMenuOpen;
    
    if (floatingMenuOpen) {
        options.classList.add('active');
        mainBtn.innerHTML = '✕';
    } else {
        options.classList.remove('active');
        mainBtn.innerHTML = '⚡';
    }
}

// Close floating menu when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!e.target.closest('.floating-menu') && floatingMenuOpen) {
        toggleFloatingMenu();
    }
});
