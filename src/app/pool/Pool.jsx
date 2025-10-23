"use client";

import { useEffect, useState } from 'react';
import { PoolLog } from "@/scripts/log";
import { socket, emit, on, off } from '@/app/components/socket';
import { flat } from '@/app/components/object';
import { getAllLastInPoolFromLocalStorage } from '@/app/components/storage';
import PoolTarget from "./PoolTarget";

const Pool = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [pool, setPool] = useState(new Map());
  const [stateUser, setStateUser] = useState({});

  const createOfflineTargetUser = (id, obj) => {
    return {
      id: id,
      username: obj.username,
      online: false,
      socketId: null
    };
  };

  const mergePoolData = (currPool) => {
    const localPoolData = getAllLastInPoolFromLocalStorage();
    const mergedPool = new Map(currPool);

    for (const id in localPoolData) {
      const existing = mergedPool.get(id);
      if (!existing || (existing && !existing.socketId)) {
        const offlineUser = createOfflineTargetUser(id, localPoolData[id]);
        mergedPool.set(id, {
          ...offlineUser
        });
      }
    }

    return mergedPool;
  };

  const calculatePoolSize = (currPool) => {
    let size = 0;
    for (const [id, user] of currPool) {
      if (id !== stateUser.id && user.online && user.socketId) {
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
        newPool = mergePoolData(newPool);
        setPool(newPool);
        PoolLog.info("sync:", newPool);
      },
      "pool:add": ({ user, broadcast }) => {
        setPool((currPool) => {
          let newPool = new Map(currPool);
          newPool.set(user.id, user);
          newPool = mergePoolData(newPool);
          PoolLog.info(broadcast ? "add (broadcast):" : "add (local):", newPool);
          return newPool;
        });
      },
      "pool:remove": (user) => {
        setPool((currPool) => {
          let newPool = new Map(currPool);
          newPool.delete(user.id);
          newPool = mergePoolData(newPool);
          PoolLog.info("remove:", newPool);
          return newPool;
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
              Connection Count: {calculatePoolSize(pool)}
            </p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-2">
          {stateUser && [...pool.values()].map((targetUser) => (
            (targetUser.id !== stateUser.id) && <PoolTarget key={targetUser.id} targetUser={targetUser} />
          ))}
        </div>
      </div>
    </div>
  </div>;
}

export default Pool;