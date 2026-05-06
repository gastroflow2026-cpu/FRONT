import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/helpers/getToken";

export interface ChatMessage {
  id: string;
  content: string;
  sender: { id: string };
  receiver: { id: string };
  read: boolean;
  createdAt: string;
}

export const useChat = (receiverId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token || !receiverId) return;

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/admin-chat`, {
      extraHeaders: {
        authorization: `Bearer ${token}`,
      },
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
  }, [receiverId]);

  const sendMessage = (content: string) => {
    if (!socketRef.current || !content.trim()) return;
    socketRef.current.emit("send_message", { receiverId, content });
  };

  return { messages, connected, sendMessage };
};