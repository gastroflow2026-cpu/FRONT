"use client";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";

interface Props {
  receiverId: string;
  currentUserId: string;
}

export const ChatBox = ({ receiverId, currentUserId }: Props) => {
  const { messages, connected, sendMessage } = useChat(receiverId);
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
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-white">
        <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-300"}`} />
        <span className="text-sm text-gray-500">
          {connected ? "Conectado" : "Desconectado"}
        </span>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                isMine
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white text-gray-800 border rounded-bl-none"
              }`}>
                {msg.content}
                <p className={`text-xs mt-1 ${isMine ? "text-blue-100" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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