import { redirect } from 'next/navigation'
import { getServerUserCookie } from "./cookie"; 
import Home from "./home/Home";

export default async function RootPage() {
  let cookieUser = await getServerUserCookie();

  if (cookieUser && cookieUser.username && cookieUser.userId) {
    redirect('/pool');
  }

  return (
    <Home />
  );
}
