import dynamic from 'next/dynamic';
import ActionProvider from './ActionProvider';
import MessageParser  from './MessageParser';
import chatConfig     from './config';

// SSR desactivado — evita el error "class constructors must be invoked with new"
const Chatbot = dynamic(
  () => import('react-chatbot-kit').then(m => m.default),
  { ssr: false }
);

// ... resto del componente ...

// Donde usas el Chatbot (línea ~746):
<Chatbot
  config={chatConfig}
  actionProvider={ActionProvider}
  messageParser={MessageParser}
/>