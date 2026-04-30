import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  botName: 'Asistente GastroFlow',
  initialMessages: [
    createChatBotMessage(
      '¡Hola! 👋 Soy el asistente de GastroFlow. Puedo ayudarte con:\n\n' +
      '🍽️ Menú\n🕐 Horarios\n📍 Ubicación\n📅 Reservas\n⚠️ Alérgenos\n\n' +
      '¿Sobre qué quieres saber?',
      {}
    ),
  ],
  customStyles: {
    botMessageBox: { backgroundColor: '#e85d26' },
    chatButton:    { backgroundColor: '#e85d26' },
  },
  state: {
    restaurantId: null,
    sessionId:    null,
  },
};

export default config;