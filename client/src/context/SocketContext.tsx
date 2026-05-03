"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { UsersContext } from "@/context/UsersContext";
import { getToken } from "@/helpers/getToken";
import { resolveRestaurantId } from "@/services/orderLifecycle";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3000";

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isLogged } = useContext(UsersContext);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const restaurantId = resolveRestaurantId(
    isLogged as Record<string, unknown> | null,
  );

  useEffect(() => {
    const token = getToken();

    if (!token || !restaurantId) {
      setSocket((currentSocket) => {
        currentSocket?.disconnect();
        return null;
      });
      setIsConnected(false);
      return;
    }

    const nextSocket = io(API_URL, {
      autoConnect: false,
      transports: ["websocket"],
      auth: { token },
    });

    const handleConnect = () => {
      setIsConnected(true);
      nextSocket.emit("join-restaurant", { restaurant_id: restaurantId });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    nextSocket.on("connect", handleConnect);
    nextSocket.on("disconnect", handleDisconnect);
    nextSocket.connect();
    setSocket(nextSocket);

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.disconnect();
      setIsConnected(false);
      setSocket(null);
    };
  }, [restaurantId]);

  const value = useMemo(
    () => ({ socket, isConnected }),
    [isConnected, socket],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);