// MessageParser.js — muy simple
class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    // No parseamos nada acá, Voiceflow se encarga
    this.actionProvider.handleUserMessage(message);
  }
}
export default MessageParser;