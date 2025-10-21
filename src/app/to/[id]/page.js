"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getUserCookie } from "../../cookie";
import { getAvatarColor, getInitials } from '@/app/components/helpers';
import { ClientLog } from "@/scripts/log";
import { socket, emit, on, off } from '@/app/components/socket';
import Link from 'next/link';

export default function DirectMessage() {
  const params = useParams();
  const user = getUserCookie();
  const messagesRef = useRef('');
  const [toUser, setToUser] = useState({});
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(socket.connected);

    if (!isConnected) return;

    const socketEvents = {
      "user:connect:after": ({ user: reqUser }) => {
        setToUser(reqUser);
        ClientLog.info("connected to:", reqUser);
      },
      "message:receive": (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    }

    on(socketEvents);

    emit("user:connect", { id: params.id });

    return () => {
      off(socketEvents);
    };
  }, [isConnected]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messagesRef.current.value.trim()) {
      const newMessage = {
        fromId: user.id,
        toId: toUser.id,
        message: messagesRef.current.value,
        timestamp: Date.now()
      };
      emit("message:send", newMessage);
      setMessages([...messages, newMessage]);
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
              <div className={`w-10 h-10 rounded-full ${getAvatarColor(toUser.username)} flex items-center justify-center text-white font-bold font-['Inter',sans-serif] text-sm`}>
                {getInitials(toUser.username)}
              </div>
              {toUser.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>

            {/* Contact Name */}
            <div>
              <h1 className="font-semibold font-['Inter',sans-serif] text-lg">
                {toUser.username}
              </h1>
              <p className="text-violet-100 text-xs font-['Inter',sans-serif]">
                {toUser.isOnline ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-2">
            {/* Call Icon */}
            <button className="p-2 rounded-full hover:bg-violet-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>

            {/* Video Call Icon */}
            <button className="p-2 rounded-full hover:bg-violet-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.fromId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.fromId === user.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'bg-violet-500 text-white'
                }`}>
                <p className="font-['Inter',sans-serif] text-sm leading-relaxed">
                  {msg.message}
                </p>
                {/* <p className={`text-xs mt-1 font-['Inter',sans-serif] ${msg.isOwn ? 'text-gray-500' : 'text-violet-100'
                  }`}>
                  {msg.timestamp}
                </p> */}
              </div>
            </div>
          ))}
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
                placeholder="Type a message..."
                name="message"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-['Inter',sans-serif] text-sm"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              className="p-3 bg-violet-500 hover:bg-violet-600 text-white rounded-full transition-colors flex items-center justify-center"
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
