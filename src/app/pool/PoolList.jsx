"use client";

import { useState } from 'react';
import ChatItem from "./ChatItem";

const PoolList = ({ user, isConnected: propIsConnected, list }) => {
  const [isConnected, setIsConnected] = useState(propIsConnected);

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
              Connection Count: {list.size}
            </p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-2">
          {[...list.values()].map((chat) => (
            (chat.id !== user.id) && <ChatItem key={chat.id} user={chat} />
          ))}
        </div>
      </div>
    </div>
  </div>;
}

export default PoolList;