"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getAvatarColor, getInitials } from '@/app/components/helpers';
import { Logger } from "@/lib/log";
import { socket, emit, on, off } from '@/app/components/socket';
import { pushMessageToLocalStorage, getMessagesFromLocalStorage, pushLastToPoolInLocalStorage, getLastInPoolFromLocalStorage } from '@/app/components/storage';
// import { flat } from '@/app/components/object';
import Message from '../../../../server/models/message';
import moment from 'moment';
import Link from 'next/link';

const UserLog = Logger.getLog("USER");

export default function DirectMessage() {
  const params = useParams();
  const messagesRef = useRef('');

  // stateUser is sender
  const [stateUser, setStateUser] = useState({});
  const [targetUser, setTargetUser] = useState({});
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const bottomRef = useRef(null);
  const scrollToBottom = () => {
    setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    setIsConnected(socket.connected);

    if (!isConnected) return;

    const socketEvents = {
      "user:connect:done": ({ user }) => {
        UserLog.info("init target:", user ? user.username : null);
        if (user) {
          setTargetUser({ ...user, online: true });
          return;
        }

        const userId = params.id;
        const offlineData = getLastInPoolFromLocalStorage(userId);
        if (!offlineData) return;
        setTargetUser({
          userId: userId,
          username: offlineData.username
        });
      },
      "user:register:done": ({ user }) => {
        UserLog.info("init sender:", user.username);
        setStateUser(() => ({ ...user }));
      },
      "user:message:receive": (newMessage) => {
        setMessages((currMsgs) => [...currMsgs, newMessage]);
        pushMessageToLocalStorage(newMessage); // save to receiver's local storage
        setLastMessage({
          message: newMessage.message,
          timestamp: newMessage.timestamp
        });
      },
      "user:message:send:done": (newMessage) => {
        setMessages((currMsgs) => [...currMsgs, newMessage]);
        scrollToBottom();
        pushMessageToLocalStorage(newMessage); // save to sender's local storage
        setLastMessage({
          message: newMessage.message,
          timestamp: newMessage.timestamp
        });
      },
      "pool:remove": ({ user }) => {
        setTargetUser((prevTarget) => user.userId === prevTarget.userId
          ? { ...prevTarget, online: false } : prevTarget);
      },
      "pool:add": ({ user }) => {
        setTargetUser((prevTarget) => user.userId === prevTarget.userId
          ? { ...user, online: true } : prevTarget);
      }
    }

    on(socketEvents);

    emit("user:connect", params.id);

    return () => {
      off(socketEvents);
    };
  }, [isConnected]);

  // Load messages from local storage on component mount
  useEffect(() => {
    if (stateUser.userId && targetUser.userId) {
      const data = getMessagesFromLocalStorage(stateUser.userId, targetUser.userId);
      setMessages((currMsgs) => (data && Array.isArray(data.messages)) ? data.messages : currMsgs);
      scrollToBottom();
    }
  }, [stateUser]);

  // Save last message of both to both sides' pools
  useEffect(() => {
    if (lastMessage && targetUser.userId) {
      pushLastToPoolInLocalStorage({
        userId: targetUser.userId,
        username: targetUser.username,
        message: lastMessage.message,
        timestamp: lastMessage.timestamp
      }, true);
    }
  }, [lastMessage]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messagesRef.current.value.trim()) {
      const messageInstance = new Message({
        fromId: stateUser.userId,
        toId: targetUser.userId,
        message: messagesRef.current.value.trim(),
      });
      emit("user:message:send", messageInstance);
      messagesRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-violet-500 text-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            {/* Back Arrow */}
            <Link
              href={`/pool`}
              className="p-2 rounded-full hover:bg-violet-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            {/* Profile Avatar */}
            <div className="relative">
              <div
                onClick={() => { console.log(targetUser) }}
                className={`w-10 h-10 rounded-full ${getAvatarColor(targetUser.username)} flex items-center justify-center text-white font-bold text-sm`}>
                {getInitials(targetUser.username)}
              </div>
              {targetUser.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>

            {/* Contact Name */}
            <div>
              <h1 className="font-semibold text-lg">
                {targetUser.username}
              </h1>
              <p className="text-violet-100 text-xs">
                {targetUser.online ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4" id="messagesContainer">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.fromId === stateUser.userId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.fromId === stateUser.userId
                ? 'bg-white text-gray-800 shadow-sm'
                : 'bg-violet-500 text-white'
                }`}>
                <p className="text-sm leading-relaxed">
                  {msg.message}
                </p>
                <p className={`text-xs mt-1 ${msg.fromId === stateUser.userId ? 'text-gray-500' : 'text-violet-100'
                  }`}>
                  {moment(msg.timestamp).format('LT')}
                </p>
              </div>
            </div>
          ))}
          <div className="scroll-anchor" ref={bottomRef}></div>
        </div>
      </div>

      {/* Message Input Section */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            {/* Input Field */}
            <div className="flex-1 relative">
              <input
                type="text"
                ref={messagesRef}
                placeholder={targetUser.online ? "Type a message..." : "User is offline..."}
                disabled={!targetUser.online}
                name="message"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              className="p-3 bg-violet-500 hover:bg-violet-600 text-white rounded-full transition-colors flex items-center justify-center"
              disabled={!targetUser.online}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
