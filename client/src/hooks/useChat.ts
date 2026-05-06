import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/helpers/getToken";
import { getApiBaseUrl } from "@/services/apiBaseUrl";

export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    restaurant?: {
      id: string;
      name?: string;
      slug?: string | null;
    } | null;
  };
  receiver: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    restaurant?: {
      id: string;
      name?: string;
      slug?: string | null;
    } | null;
  };
  read: boolean;
  createdAt: string;
}

export const useChat = (receiverId: string) => {
  const API_URL = getApiBaseUrl();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token || !receiverId) return;

    const socket = io(`${API_URL}/admin-chat`, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("get_history", { withUserId: receiverId });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("chat_history", (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on("new_message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message_sent", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [API_URL, receiverId]);

  const sendMessage = (content: string) => {
    if (!socketRef.current || !content.trim()) return;
    socketRef.current.emit("send_message", { receiverId, content });
  };

  return { messages, connected, sendMessage };
};
