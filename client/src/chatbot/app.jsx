// App.jsx o donde uses el chatbot
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import ActionProvider from '../chatbot/actionProvider';
import MessageParser from '../chatbot/messageParser';
import config from './config';

function App() {
  return (
    <Chatbot
      config={config}
      actionProvider={ActionProvider}
      messageParser={MessageParser}
    />
  );
}