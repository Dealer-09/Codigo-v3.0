import { currentUser } from "@clerk/nextjs/server";
import { DashboardView } from "~/_components/dashboard/DashboardView";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  
  // Fetch real db stats (v3.0 migration)
  const dbUser = await api.user.getStats();

  return (
    <DashboardView
      displayName={fullName || user.username || "Coder"}
      avatarUrl={user.imageUrl}
      streakDays={dbUser?.streakCount || 0}
      problemsSolved={dbUser?.problemsSolved || 0}
      easySolved={dbUser?.easyCount || 0}
      mediumSolved={dbUser?.mediumCount || 0}
      hardSolved={dbUser?.hardCount || 0}
      rank={dbUser?.rank || "Beginner"}
    />
  );
}