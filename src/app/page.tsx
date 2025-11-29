'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { Calendar, LogIn, LogOut } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-indigo-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">FocusFlow</h1>
          <p className="mt-2 text-gray-600">
            Your Personal Task Manager & Assistant
          </p>
        </div>

        {!session ? (
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Sign in with Google to access your calendar and manage tasks
            </p>
            <button
              onClick={async (e) => {
                e.preventDefault();
                console.log("Sign in button clicked");
                try {
                  console.log("Calling signIn with google");
                  const result = await signIn("google");
                  console.log("Sign in result:", result);
                  if (result?.error) {
                    console.error("Sign in error:", result.error);
                  }
                  if (result?.ok) {
                    console.log("Sign in successful");
                  }
                  if (result?.url) {
                    console.log("Redirecting to:", result.url);
                    window.location.href = result.url;
                  }
                } catch (error) {
                  console.error("Sign in exception:", error);
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogIn className="h-5 w-5" />
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {session.user?.email}
                </p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                Successfully connected to Google Calendar!
              </p>
            </div>
            
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>FocusFlow will access your Google Calendar to manage tasks</p>
        </div>
      </div>
    </div>
  );
}