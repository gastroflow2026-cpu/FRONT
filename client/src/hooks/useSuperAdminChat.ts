import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/helpers/getToken";
import { ChatMessage } from "./useChat";

const getCurrentUser = (): { id: string } | null => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export const useSuperAdminChat = () => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState<Map<string, ChatMessage[]>>(new Map());
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/admin-chat`, {
      extraHeaders: { authorization: `Bearer ${token}` },
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", (message: ChatMessage) => {
      const currentUser = getCurrentUser();
      const otherUserId =
        message.sender.id === currentUser?.id
          ? message.receiver.id
          : message.sender.id;

      setConversations((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(otherUserId) || [];
        updated.set(otherUserId, [...existing, message]);
        return updated;
      });
    });

    socket.on("message_sent", (message: ChatMessage) => {
      const currentUser = getCurrentUser();
      const otherUserId =
        message.sender.id === currentUser?.id
          ? message.receiver.id
          : message.sender.id;

      setConversations((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(otherUserId) || [];
        updated.set(otherUserId, [...existing, message]);
        return updated;
      });
    });

    socket.on("chat_history", (history: ChatMessage[]) => {
      if (!history.length) return;

      const currentUser = getCurrentUser();
      const otherUserId =
        history[0].sender.id === currentUser?.id
          ? history[0].receiver.id
          : history[0].sender.id;

      setConversations((prev) => {
        const updated = new Map(prev);
        updated.set(otherUserId, history);
        return updated;
      });

      setActiveUserId(otherUserId);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadHistory = (withUserId: string) => {
    setActiveUserId(withUserId);
    socketRef.current?.emit("get_history", { withUserId });
  };

  const sendMessage = (content: string, receiverId: string) => {
    if (!socketRef.current || !content.trim()) return;
    socketRef.current.emit("send_message", { receiverId, content });
  };

  return {
    connected,
    conversations,
    activeUserId,
    setActiveUserId,
    loadHistory,
    sendMessage,
  };
};