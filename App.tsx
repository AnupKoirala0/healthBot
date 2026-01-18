
import React, { useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are "HealthDost", a highly empathetic, warm, and professional health companion. 
Your goal is to help users with their health queries, physical problems, and emotional feelings.
Tone:
1. Deeply empathetic: Acknowledge the user's feelings first. Use phrases like "I'm so sorry you're feeling this way" or "That sounds really difficult."
2. Encouraging & Motivational: If the user is feeling down or struggling with a health goal, offer gentle motivation.
3. Informative but cautious: Provide useful health suggestions and wellness recommendations (nutrition, sleep, exercise, stress management).
4. Safety First: ALWAYS include a small disclaimer if the user mentions serious symptoms, suggesting they consult a real doctor.
5. Conversational: Keep responses concise but warm. Use bullet points for recommendations.

Example: If a user says "I've had a headache all day and I'm stressed," don't just say "Drink water." Say: "Oh, I'm so sorry to hear your head has been hurting all day; that must be so draining, especially when you're already feeling stressed. Please take a deep breath with me. Aside from the stress, have you been able to drink enough water today? Sometimes a cool compress on your forehead and dimming the lights can help. If this headache is unusually severe, please do check in with a healthcare professional."`;

const App: React.FC = () => {
  useEffect(() => {
    const chatForm = document.getElementById('chat-form') as HTMLFormElement;
    const userInput = document.getElementById('user-input') as HTMLInputElement;
    const chatWindow = document.getElementById('chat-window') as HTMLElement;
    const typingIndicator = document.getElementById('typing-indicator') as HTMLElement;
    const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
    const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
    const suggestionsContainer = document.getElementById('suggestions-container') as HTMLElement;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.8,
      },
    });

    const appendMessage = (text: string, isUser: boolean) => {
      const container = document.createElement('div');
      container.className = `flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`;

      const icon = document.createElement('div');
      icon.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
      }`;
      icon.innerHTML = isUser ? '<i class="fas fa-user text-xs"></i>' : '<i class="fas fa-robot text-xs"></i>';

      const bubble = document.createElement('div');
      bubble.className = `message-bubble p-4 text-slate-700 leading-relaxed ${
        isUser ? 'user-message' : 'bot-message'
      }`;
      
      const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      
      bubble.innerHTML = formattedText;

      container.appendChild(icon);
      container.appendChild(bubble);
      chatWindow.appendChild(container);
      
      chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: 'smooth'
      });
    };

    const sendMessage = async (message: string) => {
      if (!message.trim()) return;

      appendMessage(message, true);
      typingIndicator.classList.remove('hidden');
      chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });

      try {
        const result = await chat.sendMessage({ message });
        const responseText = result.text;
        
        typingIndicator.classList.add('hidden');
        appendMessage(responseText || "I'm sorry, I'm having a little trouble connecting right now. I'm still here for you, though.", false);
      } catch (error) {
        console.error("Chat Error:", error);
        typingIndicator.classList.add('hidden');
        appendMessage("I apologize, but I encountered an error. Please try again, I really want to help.", false);
      }
    };

    const handleSubmit = async (e: Event) => {
      e.preventDefault();
      const message = userInput.value.trim();
      if (!message) return;
      userInput.value = '';
      await sendMessage(message);
    };

    const handleSuggestionClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('suggestion-chip')) {
            const query = target.getAttribute('data-query');
            if (query) {
                sendMessage(query);
            }
        }
    };

    chatForm.addEventListener('submit', handleSubmit);
    suggestionsContainer.addEventListener('click', handleSuggestionClick as EventListener);
    
    resetBtn.addEventListener('click', () => {
      if (confirm('Would you like to restart a fresh conversation with HealthDost?')) {
        window.location.reload();
      }
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Clear all messages from view?')) {
            while (chatWindow.firstChild) {
                chatWindow.removeChild(chatWindow.firstChild);
            }
            appendMessage("I've cleared our chat history for your privacy. How else can I help you today?", false);
        }
    });

    return () => {
      chatForm.removeEventListener('submit', handleSubmit);
      suggestionsContainer.removeEventListener('click', handleSuggestionClick as EventListener);
    };
  }, []);

  return null;
};

export default App;
