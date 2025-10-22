"use client";

import { useRef } from "react";
import { redirect, RedirectType } from 'next/navigation'
import { setUserCookie } from "@/app/components/cookie";
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const usernameRef = useRef(null);

  const handleSubmit = () => {
    const user = {
      id: uuidv4(),
      username: usernameRef.current.value
    };
    setUserCookie(user);
    redirect('/pool', RedirectType.push);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white shadow-lg">
      <div className="rounded-lg p-8">
        <div className="space-y-2 w-sm">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              type="text"
              name="username"
              maxLength={10}
              placeholder="your_username"
              aria-describedby="username-description"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              ref={usernameRef}
            />
          </div>
          <p id="username-description" className="text-xs text-gray-500">
            Create an account using your username.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
