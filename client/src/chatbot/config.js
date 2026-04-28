// config.js
import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  botName: 'Asistente GastroFlow',
  initialMessages: [
    createChatBotMessage('¡Hola! ¿En qué te puedo ayudar hoy?'),
  ],
  customStyles: {
    botMessageBox: { backgroundColor: '#e85d26' },
    chatButton: { backgroundColor: '#e85d26' },
  },
  state: {
    restaurantId: null,   // se sobreescribe desde page.tsx
    sessionId: null,
  },
};

export default config;