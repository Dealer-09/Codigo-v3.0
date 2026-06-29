import { currentUser } from "@clerk/nextjs/server";
import { PracticeHub } from "~/_components/practice/PracticeHub";

export default async function PracticePage() {
  const user = await currentUser();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return <PracticeHub displayName={fullName || user?.username || "Coder"} />;
}