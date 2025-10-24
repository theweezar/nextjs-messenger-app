"use client";

import { useEffect, useState } from 'react';
import { Logger } from "@/lib/log";
import { socket, on, off } from '@/app/components/socket';
import { getAllLastInPoolFromLocalStorage } from '@/app/components/storage';
import { useAppContext } from '../contexts/AppContext';
import PoolTarget from "./PoolTarget";
import User from '../../../server/models/user';

const PoolLog = Logger.getLog("POOL");

const Pool = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [pool, setPool] = useState(new Map());
  const [stateUser, setStateUser] = useState({});
  const { ctxUser } = useAppContext();

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
        const newPool = mergeLocalPool((new Map(currPool)));
        setPool(newPool);
        PoolLog.info("sync:", newPool.size);
      },
      "pool:add": ({ user }) => {
        if (!ctxUser || (user.userId === ctxUser.userId)) return;
        setPool((currPool) => {
          PoolLog.info("add:", user.username);
          const newPool = new Map(currPool);
          newPool.set(user.userId, user);
          return mergeLocalPool(newPool);
        });
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
        PoolLog.info("register done:", user.username);
        setStateUser(() => ({ ...user }));
      }
    };

    on(socketEvents);

    return () => {
      off(socketEvents);
      console.log("Cleaned up socket events in Pool component");
    };
  }, [isConnected]);

  // useEffect(() => {
  //   PoolLog.info("pool updated:", pool);
  // }, [pool]);

  return <div className="min-h-screen bg-white shadow-lg">
    <div className="max-w-4xl mx-auto">
      <div className="px-6 py-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="w-3/4">
            {stateUser && stateUser.username ? (
              <h1 className="text-xl font-bold text-gray-800">
                Hello, {stateUser.username}
              </h1>
            ) : (
              <h1 className="text-xl font-bold text-gray-800">
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
          <div>
            <button
              onClick={() => { }}
              className="text-gray-500 hover:text-gray-800 cursor-pointer"
              aria-label="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-7.5A2.25 2.25 0 003.75 5.25v13.5A2.25 2.25 0 006 21h7.5a2.25 2.25 0 002.25-2.25V15M9 12h12m0 0l-3-3m3 3l-3 3"
                />
              </svg>
            </button>
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