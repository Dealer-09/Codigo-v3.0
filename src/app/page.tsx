import { HomePage } from "~/_components/landing/HomePage";
import { currentUser } from "@clerk/nextjs/server";

export default async function Page() {
  const user = await currentUser();
  return <HomePage hasUser={!!user} />;
}
