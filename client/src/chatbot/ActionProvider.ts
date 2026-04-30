class ActionProvider {
  createChatBotMessage: Function;
  setState: Function;

  constructor(createChatBotMessage: Function, setStateFunc: Function) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    // Mensaje de bienvenida movido a chatConfig.ts → initialMessages
  }

  handleSaludo() {
    this._addMessage(
      this.createChatBotMessage(
        '¡Hola! 😊 ¿En qué te puedo ayudar hoy?'
      )
    );
  }

  handleMenu() {
    this._addMessage(
      this.createChatBotMessage(
        '🍽️ Puedes ver nuestro menú completo en la sección "Menú" de esta página.\n\n' +
        '¿Quieres saber algo más específico?'
      )
    );
  }

  handleHorarios() {
    this._addMessage(
      this.createChatBotMessage(
        '🕐 Horarios:\n\n' +
        '📅 Lun–Vie: 12:00–15:00 y 20:00–23:00\n' +
        '📅 Sáb–Dom: 12:00–16:00 y 19:00–23:30'
      )
    );
  }

  handleUbicacion() {
    this._addMessage(
      this.createChatBotMessage(
        '📍 Nuestra dirección está en el perfil del restaurante.'
      )
    );
  }

  handleReserva() {
    this._addMessage(
      this.createChatBotMessage(
        '📅 Reserva desde esta página:\n' +
        '1️⃣ Completa el formulario\n' +
        '2️⃣ Elige fecha, hora y personas\n' +
        '3️⃣ Confirma — recibirás un email.'
      )
    );
  }

  handleAlergenos() {
    this._addMessage(
      this.createChatBotMessage(
        '⚠️ Los alérgenos están indicados en cada plato del menú.\n\n' +
        'Trabajamos con: 🌾 Gluten · 🥛 Lácteos · 🥚 Huevo · 🍷 Sulfitos'
      )
    );
  }

  handleDefault() {
    this._addMessage(
      this.createChatBotMessage(
        'No entendí tu consulta 🤔\n\nPuedo ayudarte con:\n' +
        '🍽️ Menú · 🕐 Horarios · 📍 Ubicación · 📅 Reservas · ⚠️ Alérgenos'
      )
    );
  }

  _addMessage(message: any) {
    this.setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }
}

export default ActionProvider;