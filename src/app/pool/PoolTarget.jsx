"use client";

import { useState, useEffect } from 'react';
import { socket, on, off } from '@/app/components/socket';
import { PoolLog } from '@/scripts/log';
import { getInitials, getAvatarColor } from "@/app/components/helpers";
import {
  pushMessageToLocalStorage,
  resetUnreadCountInLocalStorage,
  getLastInPoolFromLocalStorage,
  pushLastToPoolInLocalStorage
} from '@/app/components/storage';
import Link from "next/link";
import moment from 'moment';

const PoolTarget = ({ targetUser: _targetUser }) => {
  const [isConnected, setIsConnected] = useState(false);

  // stateUser is the sender user
  const [targetUser, setTargetUser] = useState({ ..._targetUser });
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState(null);
  const [trigger, setTrigger] = useState(0); // to force re-render

  // Render last message and unread count on load
  useEffect(() => {
    if (targetUser.id) {
      const data = getLastInPoolFromLocalStorage(targetUser.id);
      setUnreadCount(data.unreadCount || 0);
      setLastMessage({
        message: data.lastMessage || '',
        timestamp: data.lastTimestamp || null
      });
    }
  }, [targetUser]);

  // Listen for incoming messages
  useEffect(() => {
    setIsConnected(socket.connected);

    if (!isConnected) return;

    const socketEvents = {
      "message:receive": (newMessage) => {
        if (newMessage.fromId === targetUser.id) {
          PoolLog.info("msg receive:", newMessage);
          setUnreadCount((count) => count + 1);
          setLastMessage({
            message: newMessage.message,
            timestamp: newMessage.timestamp
          });
          setTrigger(Date.now());
          pushMessageToLocalStorage(newMessage);
        }
      },
      "pool:add": ({ user }) => {
        if (user.id === targetUser.id) {
          setTargetUser({ ...user, online: true });
        }
      },
      "pool:remove": (user) => {
        if (user.id === targetUser.id) {
          setTargetUser((curr) => ({
            ...curr,
            online: false,
            socketId: null
          }));
        }
      }
    };

    on(socketEvents);

    return () => {
      off(socketEvents);
    };
  }, [isConnected]);

  // Save last message to local storage when not connecting to direct message
  useEffect(() => {
    if (trigger !== 0 && lastMessage && targetUser.id) {
      pushLastToPoolInLocalStorage({
        id: targetUser.id,
        username: targetUser.username,
        message: lastMessage.message,
        timestamp: lastMessage.timestamp
      });
    }
  }, [trigger, lastMessage]);

  const resetUnread = () => {
    setUnreadCount(0);
    resetUnreadCountInLocalStorage(targetUser.id);
  };

  const renderLastMessage = (message) => {
    if (!message) return '';
    return message.length > 15 ? message.substring(0, 15) + '...' : message;
  }

  const renderLastTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return moment(timestamp).format('LT');
  }

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
        {targetUser.online && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Chat Content */}
      <div className="flex-1 ml-4 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-800 truncate font-['Inter',sans-serif]">
            {targetUser.username}
          </h3>
          <span className="text-sm text-gray-500 font-['Inter',sans-serif] flex-shrink-0 ml-2" timestamp={lastMessage && lastMessage.timestamp}>
            {lastMessage && lastMessage.timestamp ? renderLastTimestamp(lastMessage.timestamp) : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm truncate font-['Inter',sans-serif]">
            {(lastMessage && lastMessage.message) ? renderLastMessage(lastMessage.message) : ''}
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

export default PoolTarget;