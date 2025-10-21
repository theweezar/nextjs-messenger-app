"use client";

import { useEffect, useState } from "react";
import { socket, emit, on, off } from '@/app/components/socket';
import { PoolLog, ClientLog } from "@/scripts/log";
import { useAppContext } from "@/app/AppContext";
import ChatItem from "./ChatItem";

export default function Pool() {
  const { ctxUser } = useAppContext();
  const [isConnected, setIsConnected] = useState(false);
  const [pool, setPool] = useState(new Map());
  const [user, setUser] = useState({});
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setIsConnected(socket.connected);

    if (!ctxUser || !isConnected) return;

    const socketEvents = {
      "pool:sync": (currentPool) => {
        const newPool = new Map(currentPool);
        setPool(newPool);
        PoolLog.info("sync:", newPool);
      },
      "pool:add": ({ user: _user, broadcast }) => {
        setPool((prevPool) => {
          const newPool = new Map(prevPool);
          newPool.set(_user.id, _user);
          PoolLog.info(broadcast ? "add (broadcast):" : "add (local):", newPool);
          return newPool;
        });
      },
      "pool:remove": (_user) => {
        setPool((prevPool) => {
          const newPool = new Map(prevPool);
          newPool.delete(_user.id);
          PoolLog.info("remove:", newPool);
          return newPool;
        });
      },
      "user:register:after": (_user) => {
        ClientLog.info("registered:", _user);
        setUser(_user);
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

  const PoolList = () => {
    return <div className="min-h-screen bg-white shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="px-6 py-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              {user && user.username ? (
                <h1 className="text-3xl font-bold text-gray-800 font-['Inter',sans-serif]">
                  Hello, {user.username}
                </h1>
              ) : (
                <h1 className="text-3xl font-bold text-gray-800 font-['Inter',sans-serif]">
                  Hello, Guest
                </h1>
              )}
              <p className="text-sm text-gray-500 mt-1 font-['Inter',sans-serif]">
                Connection Status: {isConnected ? "Connected" : "Disconnected"}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-['Inter',sans-serif]">
                Connection Count: {pool.size} | Events: {events.length}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-2">
            {[...pool.values()].map((chat) => (
              (chat.id !== user.id) && <ChatItem key={chat.id} user={chat} />
            ))}
          </div>
        </div>
      </div>
    </div>;
  }

  return (
    (ctxUser ? <PoolList /> : <></>)
  );
}
