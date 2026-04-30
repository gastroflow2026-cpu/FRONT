class MessageParser {
  actionProvider: any;

  constructor(actionProvider: any) {
    this.actionProvider = actionProvider;
  }

  parse(message: string) {
    const msg = message.toLowerCase().trim();

    if (['menú','menu','plato','comida','carta','comer','qué tienen']
        .some(k => msg.includes(k))) return this.actionProvider.handleMenu();

    if (['horario','hora','abre','cierra','cuando','cuándo','abierto','cerrado']
        .some(k => msg.includes(k))) return this.actionProvider.handleHorarios();

    if (['ubicación','ubicacion','dónde','donde','dirección','direccion',
         'cómo llegar','como llegar','lugar']
        .some(k => msg.includes(k))) return this.actionProvider.handleUbicacion();

    if (['reserva','reservar','mesa','booking','turno','lugar para']
        .some(k => msg.includes(k))) return this.actionProvider.handleReserva();

    if (['alérgeno','alergeno','alergia','gluten','lactosa','celiaco',
         'celíaco','vegano','vegetariano','sin tacc','intolerante']
        .some(k => msg.includes(k))) return this.actionProvider.handleAlergenos();

    if (['hola','buenos días','buenas','hi','hello']
        .some(k => msg.includes(k))) return this.actionProvider.handleSaludo();

    return this.actionProvider.handleDefault();
  }
}

export default MessageParser;