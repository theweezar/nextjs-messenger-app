"use client";

import { useEffect, useState } from "react";
import { socket, emit } from '@/app/components/socket';
import { useAppContext } from "@/app/AppContext";

export default function PoolWrapper({ children }) {
  const { ctxUser } = useAppContext();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(socket.connected);

    if (!ctxUser || !isConnected) return;

    emit("user:register", {
      id: ctxUser.id,
      username: ctxUser.username
    });

    return () => { };
  }, [isConnected]);

  return (
    <>
      {children}
    </>
  );
}
