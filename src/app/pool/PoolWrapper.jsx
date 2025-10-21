"use client";

import { useEffect, useState } from "react";
import { socket, emit, on, off } from '@/app/components/socket';
import { PoolLog, ClientLog } from "@/scripts/log";
import { useAppContext } from "@/app/AppContext";

export default function PoolWrapper({ Child }) {
  const { ctxUser } = useAppContext();
  const [isConnected, setIsConnected] = useState(false);
  const [pool, setPool] = useState(new Map());
  const [stateUser, setStateUser] = useState({});

  useEffect(() => {
    setIsConnected(socket.connected);

    if (!ctxUser || !isConnected) return;

    const socketEvents = {
      "pool:sync": (currentPool) => {
        const newPool = new Map(currentPool);
        setPool(newPool);
        PoolLog.info("sync:", newPool);
      },
      "pool:add": ({ user, broadcast }) => {
        setPool((prevPool) => {
          prevPool.set(user.id, user);
          PoolLog.info(broadcast ? "add (broadcast):" : "add (local):", prevPool);
          return new Map(prevPool);
        });
      },
      "pool:remove": (user) => {
        setPool((prevPool) => {
          prevPool.delete(user.id);
          PoolLog.info("remove:", prevPool);
          return new Map(prevPool);
        });
      },
      "user:register:after": (user) => {
        ClientLog.info("registered:", user);
        setStateUser(() => ({ ...user }));
        emit("pool:sync");
      }
    };

    on(socketEvents);

    emit("user:register", {
      id: ctxUser.id,
      username: ctxUser.username
    });

    return () => {
      off(socketEvents);
    };
  }, [isConnected]);

  return (
    <>
      {Child && <Child user={stateUser} isConnected={isConnected} list={pool} />}
    </>
  );
}
