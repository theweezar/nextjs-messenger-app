import "./globals.css";
import { AppProvider } from "./AppContext";
import { cookies } from "next/headers";

export const metadata = {
  title: "Messenger App",
  description: "A simple messenger application built with Next.js",
};

export default async function RootLayout({ children }) {
  let cookieUser = null;

  try {
    const cookieStore = await cookies();
    cookieUser = cookieStore.get("user");
    cookieUser = cookieUser ? JSON.parse(cookieUser.value) : null;
  } catch (error) {
    cookieUser = null;
    console.error("Error parsing user cookie:", error);
  }

  console.log(`[LAYOUT] username=${cookieUser ? cookieUser.username : 'guest'} id=${cookieUser ? cookieUser.id : 'N/A'}`);

  return (
    <html lang="en">
      <body
        className="antialiased bg-indigo-50 flex min-h-screen items-center justify-center"
      >
        <AppProvider user={cookieUser}>
          <div className="w-full max-w-md space-y-6">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
