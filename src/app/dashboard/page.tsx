import { currentUser } from "@clerk/nextjs/server";
import { DashboardView } from "~/_components/dashboard/DashboardView";

export default async function DashboardPage() {
  const user = await currentUser();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <DashboardView
      displayName={fullName || user?.username || "Coder"}
      avatarUrl={user?.imageUrl}
      streakDays={12}
    />
  );
}