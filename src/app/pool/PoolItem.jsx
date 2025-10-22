"use client";

import { useState, useEffect } from 'react';
import { socket, on, off } from '@/app/components/socket';
import { PoolLog } from '@/scripts/log';
import { getInitials, getAvatarColor } from "@/app/components/helpers";
import { pushMessageToLocalStorage, getMessagesFromLocalStorage, updateUnreadCountInLocalStorage } from '@/app/components/storage';
import Link from "next/link";

const PoolItem = ({ user, targetUser: _targetUser }) => {
  const [isConnected, setIsConnected] = useState(false);

  // stateUser is the sender user
  const [stateUser, setStateUser] = useState({ ...user });
  const [targetUser, setTargetUser] = useState({ ..._targetUser });
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState('');

  useEffect(() => {
    if (stateUser.id) {
      const data = getMessagesFromLocalStorage(stateUser.id, targetUser.id);
      setUnreadCount(data.unreadCount || 0);
      setLastMessage(data.lastMessage || '');
    }
  }, [stateUser]);

  useEffect(() => {
    setIsConnected(socket.connected);
    if (!isConnected) return;

    const socketEvents = {
      "message:receive": (newMessage) => {
        PoolLog.info("msg receive:", newMessage);
        if (newMessage.fromId === targetUser.id) {
          setUnreadCount((count) => {
            const newCount = count + 1;
            pushMessageToLocalStorage(newMessage, newCount);
            return newCount;
          });
          setLastMessage(newMessage.message);
        }
      }
    };

    on(socketEvents);

    return () => {
      off(socketEvents);
    };
  }, [isConnected]);

  const resetUnread = () => {
    setUnreadCount(0);
    updateUnreadCountInLocalStorage(stateUser.id, targetUser.id, 0);
  };

  return (
    <Link
      className="flex items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
      key={targetUser.id}
      id={targetUser.id}
      href={`/to/${targetUser.id}`}
      onClick={resetUnread}
    >
      {/* Profile Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-full ${getAvatarColor(targetUser.username)} flex items-center justify-center text-white font-bold font-['Inter',sans-serif]`}
        >
          {getInitials(targetUser.username)}
        </div>
        {/* Online status indicator */}
        {targetUser.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Chat Content */}
      <div className="flex-1 ml-4 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-800 truncate font-['Inter',sans-serif]">
            {targetUser.username}
          </h3>
          <span className="text-sm text-gray-500 font-['Inter',sans-serif] flex-shrink-0 ml-2">
            {targetUser.timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm truncate font-['Inter',sans-serif]">
            {lastMessage}
          </p>
          {/* Unread message indicator */}
          {unreadCount > 0 && (
            <div className="ml-2 flex-shrink-0">
              <span className="bg-violet-500 text-white text-xs font-semibold px-1 py-1 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center font-['Inter',sans-serif]">
                {unreadCount > 5 ? '5+' : unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PoolItem;