"use client";
import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatBox } from "./chatBox";
import { getCurrentUser } from "@/helpers/getToken";

const SUPER_ADMIN_ID = process.env.NEXT_PUBLIC_SUPER_ADMIN_ID!;

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUserId(user.id);
  }, []);

  if (!currentUserId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 h-[480px] bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col">
          <ChatBox receiverId={SUPER_ADMIN_ID} currentUserId={currentUserId} />
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
};