"use client";

import { useEffect, useState } from 'react';
import { PoolLog } from "@/scripts/log";
import { socket, emit, on, off } from '@/app/components/socket';
import { flat } from '@/app/components/object';
import PoolTarget from "./PoolTarget";

const Pool = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [pool, setPool] = useState(new Map());
  const [stateUser, setStateUser] = useState({});

  useEffect(() => {
    setIsConnected(socket.connected);

    if (!isConnected) return;

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
        PoolLog.info("registered:", flat(user));
        setStateUser(() => ({ ...user }));
        emit("pool:sync");
      }
    };

    on(socketEvents);

    return () => {
      off(socketEvents);
    };
  }, [isConnected]);

  return <div className="min-h-screen bg-white shadow-lg">
    <div className="max-w-4xl mx-auto">
      <div className="px-6 py-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            {stateUser && stateUser.username ? (
              <h1 className="text-3xl font-bold text-gray-800 font-['Inter',sans-serif]">
                Hello, {stateUser.username}
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
              Connection Count: {pool.size}
            </p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-2">
          {stateUser && [...pool.values()].map((targetUser) => (
            (targetUser.id !== stateUser.id) && <PoolTarget key={targetUser.id} user={stateUser} targetUser={targetUser} />
          ))}
        </div>
      </div>
    </div>
  </div>;
}

export default Pool;