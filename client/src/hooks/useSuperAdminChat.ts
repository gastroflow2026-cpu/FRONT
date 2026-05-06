import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/helpers/getToken";
import { ChatMessage } from "./useChat";
import { getApiBaseUrl } from "@/services/apiBaseUrl";

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
  const API_URL = getApiBaseUrl();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState<Map<string, ChatMessage[]>>(new Map());
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [unreadByUser, setUnreadByUser] = useState<Map<string, number>>(new Map());
  const activeUserIdRef = useRef<string | null>(null);

  const resolveOtherUserId = (message: ChatMessage, currentUserId?: string) =>
    message.sender.id === currentUserId ? message.receiver.id : message.sender.id;

  useEffect(() => {
    activeUserIdRef.current = activeUserId;
  }, [activeUserId]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(`${API_URL}/admin-chat`, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", (message: ChatMessage) => {
      const currentUser = getCurrentUser();
      const otherUserId = resolveOtherUserId(message, currentUser?.id);

      setConversations((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(otherUserId) || [];
        updated.set(otherUserId, [...existing, message]);
        return updated;
      });

      setUnreadByUser((prev) => {
        if (
          message.sender.id === currentUser?.id ||
          activeUserIdRef.current === otherUserId
        ) {
          return prev;
        }

        const updated = new Map(prev);
        const currentUnread = updated.get(otherUserId) ?? 0;
        updated.set(otherUserId, currentUnread + 1);
        return updated;
      });
    });

    socket.on("message_sent", (message: ChatMessage) => {
      const currentUser = getCurrentUser();
      const otherUserId = resolveOtherUserId(message, currentUser?.id);

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
  }, [API_URL]);

  const loadHistory = (withUserId: string) => {
    setActiveUserId(withUserId);
    setUnreadByUser((prev) => {
      const updated = new Map(prev);
      updated.delete(withUserId);
      return updated;
    });
    socketRef.current?.emit("get_history", { withUserId });
  };

  const markConversationRead = (withUserId: string) => {
    setUnreadByUser((prev) => {
      const updated = new Map(prev);
      updated.delete(withUserId);
      return updated;
    });
  };

  const totalUnread = Array.from(unreadByUser.values()).reduce((acc, count) => acc + count, 0);

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
    unreadByUser,
    totalUnread,
    markConversationRead,
    sendMessage,
  };
};
