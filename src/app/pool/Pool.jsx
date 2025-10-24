"use client";

import { useEffect, useState } from 'react';
import { PoolLog } from "@/lib/log";
import { socket, on, off } from '@/app/components/socket';
import { getAllLastInPoolFromLocalStorage } from '@/app/components/storage';
import PoolTarget from "./PoolTarget";
import User from '../../../server/models/user';

const Pool = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [pool, setPool] = useState(new Map());
  const [stateUser, setStateUser] = useState({});

  const mergeLocalPool = (currPool) => {
    const localPool = getAllLastInPoolFromLocalStorage();
    const mergedPool = new Map(currPool);

    for (const id in localPool) {
      const existing = mergedPool.get(id);
      if (!existing || (existing && !existing.socketId)) {
        const localObj = localPool[id]
        const offlineUser = new User({ userId: id, username: localObj.username });
        offlineUser.message = localObj.message || null;
        offlineUser.timestamp = localObj.timestamp || null;
        offlineUser.unreadCount = localObj.unreadCount || 0;
        mergedPool.set(id, offlineUser);
      }
    }

    return mergedPool;
  };

  const calculatePoolSize = (currPool) => {
    let size = 0;
    for (const [id, user] of currPool) {
      if (id !== stateUser.userId && user.online && user.socketId) {
        size += 1;
      }
    }
    return size;
  }

  useEffect(() => {
    setIsConnected(socket.connected);

    if (!isConnected) return;

    const socketEvents = {
      "pool:sync": (currPool) => {
        let newPool = new Map(currPool);
        newPool = mergeLocalPool(newPool);
        setPool(newPool);
        PoolLog.info("sync:", newPool.size);
      },
      "pool:remove": ({ user }) => {
        setPool((currPool) => {
          PoolLog.info("remove:", user.username);
          const newPool = new Map(currPool);
          newPool.delete(user.userId);
          return mergeLocalPool(newPool);
        });
      },
      "user:register:done": ({ user }) => {
        PoolLog.info("user:register:done:", user.username);
        setStateUser(() => ({ ...user }));
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
              <h1 className="text-3xl font-bold text-gray-800">
                Hello, {stateUser.username}
              </h1>
            ) : (
              <h1 className="text-3xl font-bold text-gray-800">
                Hello, Guest
              </h1>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Connection Status: {isConnected ? "Connected" : "Disconnected"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Connection Count: {calculatePoolSize(pool)}
            </p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-2">
          {stateUser && [...pool.values()].map((targetUser) => (
            (targetUser.userId !== stateUser.userId) && <PoolTarget key={targetUser.userId} targetUser={targetUser} />
          ))}
        </div>
      </div>
    </div>
  </div>;
}

export default Pool;