"use client";

import { useEffect, useState } from "react";
import { socket, emit } from '@/app/components/socket';
import { useAppContext } from "@/app/contexts/AppContext";

export default function PoolWrapper({ children }) {
  const { ctxUser } = useAppContext();
  const [isConnected, setIsConnected] = useState(false);

  // Handle socket connection and user registration
  useEffect(() => {
    setIsConnected(socket.connected);

    if (!ctxUser || !isConnected) return;

    emit("user:register", {
      userId: ctxUser.userId,
      username: ctxUser.username
    });

    return () => { };
  }, [isConnected]);

  // Handle socket disconnection on page unload
  useEffect(() => {
    window.addEventListener("beforeunload", () => {
      if (socket.connected) {
        socket.disconnect();
      }
    });

    return () => {
      window.removeEventListener("beforeunload", () => { });
    };
  }, []);

  return (
    <>
      {children}
    </>
  );
}
