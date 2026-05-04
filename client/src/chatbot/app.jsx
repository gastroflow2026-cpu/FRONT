"use client";

import { useState, useRef, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";

export default function ChatbotApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 500 });

  const { socket, isConnected } = useSocket();

  const [messages, setMessages] = useState([
    { text: "Hola 👋", sender: "bot" },
    { text: "¿En qué podemos ayudarte?", sender: "bot" },
  ]);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // =========================
  // ENVIAR MENSAJE
  // =========================
  const handleSend = (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const text = input.trim();

    setMessages((prev) => [...prev, { text, sender: "user" }]);
    setInput("");

    socket?.emit("chat:message", {
      message: text,
      sender: "client",
    });
  };

  // =========================
  // RECIBIR MENSAJE
  // =========================
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          text: data.message,
          sender: "bot",
        },
      ]);
    };

    socket.on("chat:message", handleIncomingMessage);

    return () => {
      socket.off("chat:message", handleIncomingMessage);
    };
  }, [socket]);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================
  // DRAG
  // =========================
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    dragging.current = true;

    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;

    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  // =========================
  // UI
  // =========================
  return (
    <div
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 9999,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {isOpen && (
        <div
          style={{
            width: "320px",
            height: "420px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
            overflow: "hidden",
            marginBottom: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* HEADER */}
          <div
            onMouseDown={handleMouseDown}
            style={{
              background: "#ff512f",
              color: "white",
              padding: "14px",
              cursor: "grab",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            <span>GastroFlow Chat</span>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          {/* MENSAJES */}
          <div
            style={{
              padding: "16px",
              height: "300px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  background: msg.sender === "user" ? "#ff512f" : "#f3f4f6",
                  color: msg.sender === "user" ? "white" : "#111827",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  maxWidth: "75%",
                }}
              >
                {msg.text}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <form
            onSubmit={handleSend}
            style={{
              padding: "12px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isConnected ? "Escribe un mensaje..." : "Socket no conectado..."
              }
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
              }}
            />

            <button
              type="submit"
              style={{
                background: "#ff512f",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0 14px",
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* BOTÓN FLOTANTE */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseDown={handleMouseDown}
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ff512f, #dd2476)",
          border: "2px solid rgba(255,255,255,0.15)",
          cursor: "grab",
          boxShadow: `
            0 10px 25px rgba(0,0,0,0.4),
            0 0 20px rgba(221,36,118,0.6)
          `,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(6px)",
          overflow: "hidden",
        }}
      >
        {isOpen ? (
          <span style={{ color: "white", fontSize: "30px" }}>×</span>
        ) : (
          <img
            src="/logo.png"
            alt="GastroFlow"
            style={{
              width: "38px",
              height: "38px",
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
            }}
          />
        )}
      </button>
    </div>
  );
}
