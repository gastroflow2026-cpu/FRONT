"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, ArrowLeft } from "lucide-react";
import { useSuperAdminChat } from "@/hooks/useSuperAdminChat";
import { ChatMessage } from "@/hooks/useChat";

const getCurrentUser = (): { id: string } | null => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export const SuperAdminChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const {
    connected,
    conversations,
    activeUserId,
    setActiveUserId,
    loadHistory,
    unreadByUser,
    totalUnread,
    markConversationRead,
    sendMessage,
  } = useSuperAdminChat();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUserId(user.id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeUserId]);

  const activeMessages: ChatMessage[] = activeUserId
    ? conversations.get(activeUserId) || []
    : [];

  const adminList = Array.from(conversations.keys()).filter(Boolean);

  const resolveRestaurantLabel = (message: ChatMessage, otherUserId: string) => {
    const otherUser = message.sender.id === otherUserId ? message.sender : message.receiver;
    return (
      otherUser.restaurant?.name ||
      otherUser.email ||
      "Restaurante"
    );
  };

  const handleSend = () => {
    if (!input.trim() || !activeUserId) return;
    sendMessage(input, activeUserId);
    setInput("");
  };

  if (!currentUserId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 h-[480px] bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-white">
            {activeUserId && (
              <button
                onClick={() => setActiveUserId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <span
              className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-300"}`}
            />
            <span className="text-sm text-gray-600 font-medium">
              {activeUserId ? "Conversación" : "Mensajes de Admins"}
            </span>
          </div>

          {/* Lista de admins */}
          {!activeUserId && (
            <div className="flex-1 overflow-y-auto">
              {adminList.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Sin mensajes aún
                </div>
              ) : (
                adminList.map((userId, index) => {
                  const msgs = conversations.get(userId) || [];
                  const last = msgs[msgs.length - 1];
                  const unreadCount = unreadByUser.get(userId) ?? 0;
                  const displayName = last ? resolveRestaurantLabel(last, userId) : "Restaurante";
                  return (
                    <button
                      key={`${userId}-${index}`}
                      onClick={() => {
                        markConversationRead(userId);
                        loadHistory(userId);
                      }}
                      className="w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition relative"
                    >
                      <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {last?.content}
                      </p>
                      {unreadCount > 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Conversación activa */}
          {activeUserId && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                {activeMessages.map((msg: ChatMessage) => {
                  const isMine = msg.sender.id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                          isMine
                            ? "bg-orange-500 text-black rounded-br-none"
                            : "bg-white text-gray-800 border rounded-bl-none"
                        }`}
                      >
                        {msg.content}
                        <p
                          className={`text-xs mt-1 ${isMine ? "text-orange-100" : "text-gray-400"}`}
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

              <div className="flex gap-2 p-3 border-t bg-white">
                <input
                  className="flex-1 border rounded-full px-4 py-2 text-sm text-black placeholder:text-gray-400 outline-none focus:border-orange-400"
                  placeholder="Escribe un mensaje..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!connected}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-full px-4 py-2 text-sm transition"
                >
                  Enviar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>
    </div>
  );
};
