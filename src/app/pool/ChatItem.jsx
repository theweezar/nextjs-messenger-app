"use client";

import { useState } from "react";
import Link from "next/link";
import { getInitials, getAvatarColor } from "@/app/components/helpers";

const ChatItem = ({ user }) => {
  const [thisUser, setThisUser] = useState(user);

  return (
    <Link
      className="flex items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
      key={thisUser.id}
      id={thisUser.id}
      href={`/to/${thisUser.id}`}
    >
      {/* Profile Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-full ${getAvatarColor(thisUser.username)} flex items-center justify-center text-white font-bold font-['Inter',sans-serif]`}
        >
          {getInitials(thisUser.username)}
        </div>
        {/* Online status indicator */}
        {thisUser.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Chat Content */}
      <div className="flex-1 ml-4 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-800 truncate font-['Inter',sans-serif]">
            {thisUser.username}
          </h3>
          <span className="text-sm text-gray-500 font-['Inter',sans-serif] flex-shrink-0 ml-2">
            {thisUser.timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm truncate font-['Inter',sans-serif]">
            {thisUser.lastMessage}
          </p>
          {/* Unread message indicator */}
          {thisUser.unreadCount > 0 && (
            <div className="ml-2 flex-shrink-0">
              <span className="bg-violet-500 text-white text-xs font-semibold px-1 py-1 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center font-['Inter',sans-serif]">
                {thisUser.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ChatItem;