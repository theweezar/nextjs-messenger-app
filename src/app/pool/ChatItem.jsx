"use client";

import { useState, useEffect } from 'react';
import { socket, emit, on, off } from '@/app/components/socket';
import { PoolLog } from '@/scripts/log';
import Link from "next/link";
import { getInitials, getAvatarColor } from "@/app/components/helpers";

const ChatItem = ({ user }) => {
  const [stateUser, setStateUser] = useState({ ...user, unreadCount: 0 });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(socket.connected);
    if (!isConnected) return;

    const socketEvents = {
      "message:receive": (newMessage) => {
        PoolLog.info("msg receive:", newMessage);
        setStateUser((prevUser) => {
          if (newMessage.fromId === prevUser.id) {
            return {
              ...prevUser,
              // lastMessage: newMessage.message,
              // timestamp: new Date(newMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unreadCount: prevUser.unreadCount + 1
            };
          }
          return prevUser;
        });
      }
    };

    on(socketEvents);

    return () => {
      off(socketEvents);
    };
  }, [isConnected]);

  return (
    <Link
      className="flex items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
      key={stateUser.id}
      id={stateUser.id}
      href={`/to/${stateUser.id}`}
    >
      {/* Profile Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-full ${getAvatarColor(stateUser.username)} flex items-center justify-center text-white font-bold font-['Inter',sans-serif]`}
        >
          {getInitials(stateUser.username)}
        </div>
        {/* Online status indicator */}
        {stateUser.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Chat Content */}
      <div className="flex-1 ml-4 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-800 truncate font-['Inter',sans-serif]">
            {stateUser.username}
          </h3>
          <span className="text-sm text-gray-500 font-['Inter',sans-serif] flex-shrink-0 ml-2">
            {stateUser.timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm truncate font-['Inter',sans-serif]">
            {stateUser.lastMessage}
          </p>
          {/* Unread message indicator */}
          {stateUser.unreadCount > 0 && (
            <div className="ml-2 flex-shrink-0">
              <span className="bg-violet-500 text-white text-xs font-semibold px-1 py-1 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center font-['Inter',sans-serif]">
                {stateUser.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ChatItem;