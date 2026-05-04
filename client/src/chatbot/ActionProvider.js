// ActionProvider.js
class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage, stateRef) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.stateRef = stateRef;
  }

  async handleUserMessage(message) {
    // Tomamos el restaurantId del estado del chatbot (lo pasamos desde page.tsx)
    const restaurantId = this.stateRef?.restaurantId ?? 'default';
    const userID = this.stateRef?.sessionId ?? 'user-' + Date.now();

    try {
      const res = await fetch(
        `http://localhost:3000/chatbot/interact/${restaurantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID, message }),
        }
      );

      const data = await res.json();

      data.messages.forEach((msg) => {
        const botMessage = this.createChatBotMessage(msg);
        this.setState((prev) => ({
          ...prev,
          messages: [...prev.messages, botMessage],
        }));
      });
    } catch (error) {
      const errorMsg = this.createChatBotMessage(
        'Lo siento, hubo un problema al conectarme. Intentá de nuevo.'
      );
      this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
      }));
    }
  }
}

export default ActionProvider;