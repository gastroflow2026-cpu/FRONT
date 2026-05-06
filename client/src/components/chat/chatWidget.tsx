"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";
import { useChat, ChatMessage } from "@/hooks/useChat";

const getCurrentUser = (): { id: string } | null => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

const SUPER_ADMIN_ID = process.env.NEXT_PUBLIC_SUPER_ADMIN_ID?.trim() ?? "";

const ChatBox = ({
  currentUserId,
  messages,
  connected,
  sendMessage,
}: {
  currentUserId: string;
  messages: ChatMessage[];
  connected: boolean;
  sendMessage: (content: string) => void;
}) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-white">
        <span
          className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-300"}`}
        />
        <span className="text-sm text-gray-500">
          {connected ? "Conectado" : "Desconectado"}
        </span>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((msg: ChatMessage) => {
          const isMine = msg.sender.id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  isMine
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 border rounded-bl-none"
                }`}
              >
                {msg.content}
                {!isMine && (
                  <p className="text-xs mt-1 text-gray-500 font-medium">GastroFlow Team</p>
                )}
                <p
                  className={`text-xs mt-1 ${isMine ? "text-blue-100" : "text-gray-400"}`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t bg-white">
        <input
          className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-blue-400"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!connected}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full px-4 py-2 text-sm transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const isChatConfigured = Boolean(SUPER_ADMIN_ID);
  const { messages, connected, sendMessage } = useChat(isChatConfigured ? SUPER_ADMIN_ID : "");
  const previousMessagesCountRef = useRef(0);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUserId(user.id);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const previousLength = previousMessagesCountRef.current;
    const currentLength = messages.length;

    if (currentLength <= previousLength) {
      previousMessagesCountRef.current = currentLength;
      return;
    }

    const hasIncrementalMessage = previousLength > 0 && currentLength === previousLength + 1;
    const latestMessage = messages[currentLength - 1];

    if (hasIncrementalMessage && !isOpen && latestMessage?.sender.id !== currentUserId) {
      setUnreadCount((prev) => prev + 1);
    }

    previousMessagesCountRef.current = currentLength;
  }, [currentUserId, isOpen, messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  if (!currentUserId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 h-[480px] bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col">
          {isChatConfigured ? (
            <ChatBox
              currentUserId={currentUserId}
              messages={messages}
              connected={connected}
              sendMessage={sendMessage}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-gray-500">
              Chat no configurado: falta NEXT_PUBLIC_SUPER_ADMIN_ID
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
