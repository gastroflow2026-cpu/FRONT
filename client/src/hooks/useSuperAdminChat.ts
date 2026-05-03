import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/helpers/getToken";
import { ChatMessage } from "./useChat";

export interface Conversation {
  userId: string;
  name: string;
  lastMessage: string;
  unread: number;
}

export const useSuperAdminChat = () => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState<Map<string, ChatMessage[]>>(new Map());
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      extraHeaders: { authorization: `Bearer ${token}` },
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", (message: ChatMessage) => {
      setConversations((prev) => {
        const updated = new Map(prev);
        const senderId = message.senderId;
        const existing = updated.get(senderId) || [];
        updated.set(senderId, [...existing, message]);
        return updated;
      });
    });

    socket.on("chat_history", (history: ChatMessage[]) => {
      if (!history.length) return;
      const otherUserId = history[0].senderId === activeUserId
        ? history[0].senderId
        : history[0].senderId;
      setConversations((prev) => {
        const updated = new Map(prev);
        updated.set(otherUserId, history);
        return updated;
      });
    });

    return () => { socket.disconnect(); };
  }, []);

  const loadHistory = (withUserId: string) => {
    setActiveUserId(withUserId);
    socketRef.current?.emit("get_history", { withUserId });
  };

  const sendMessage = (content: string, receiverId: string) => {
    if (!socketRef.current || !content.trim()) return;
    socketRef.current.emit("send_message", { receiverId, content });
  };

  return { connected, conversations, activeUserId, setActiveUserId, loadHistory, sendMessage };
};