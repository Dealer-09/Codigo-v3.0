import { currentUser } from "@clerk/nextjs/server";
import { DashboardView } from "~/_components/dashboard/DashboardView";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const displayName = user.username || [user.firstName, user.lastName].filter(Boolean).join(" ") || "Coder";
  const email = user.emailAddresses[0]?.emailAddress || `${user.id}@placeholder.com`;
  
  // Sync Clerk profile data to our database for leaderboards
  await db.user.upsert({
      where: { clerkId: user.id },
      update: { name: displayName, image: user.imageUrl },
      create: { clerkId: user.id, name: displayName, image: user.imageUrl, email: email }
  });

  // Fetch real db stats (v3.0 migration)
  const dbUser = await api.user.getStats();

  // Generate actual heatmap data
  const solvedDates = dbUser?.solvedProblems?.map(p => p.firstSolvedAt) || [];
  
  const dateCounts: Record<string, number> = {};
  for (const d of solvedDates) {
      if (!d) continue;
      const key = d.toISOString().split('T')[0];
      if (key) {
          dateCounts[key] = (dateCounts[key] || 0) + 1;
      }
  }

  const today = new Date();
  const currentDayOfWeek = (today.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(52).fill(0));
  for(let d=0; d<7; d++) {
      for(let w=0; w<52; w++) {
          const weeksAgo = 52 - 1 - w;
          const daysOffset = weeksAgo * 7 + (currentDayOfWeek - d);
          
          const cellDate = new Date(today);
          cellDate.setDate(today.getDate() - daysOffset);
          
          if (cellDate > today) {
              heatmap[d]![w] = 0;
          } else {
              const key = cellDate.toISOString().split('T')[0];
              const count = key ? (dateCounts[key] || 0) : 0;
              if (count > 5) heatmap[d]![w] = 4;
              else if (count > 3) heatmap[d]![w] = 3;
              else if (count > 1) heatmap[d]![w] = 2;
              else if (count === 1) heatmap[d]![w] = 1;
              else heatmap[d]![w] = 0;
          }
      }
  }

  const daysList = [
    { day: "Mon", fullDay: "Monday" },
    { day: "Tue", fullDay: "Tuesday" },
    { day: "Wed", fullDay: "Wednesday" },
    { day: "Thu", fullDay: "Thursday" },
    { day: "Fri", fullDay: "Friday" },
    { day: "Sat", fullDay: "Saturday" },
    { day: "Sun", fullDay: "Sunday" },
  ];
  
  const weeklyData = daysList.map((d, i) => {
      const offset = currentDayOfWeek - i;
      const cellDate = new Date(today);
      cellDate.setDate(today.getDate() - offset);
      const key = cellDate.toISOString().split('T')[0]!;
      return {
          ...d,
          solved: cellDate > today ? 0 : (key ? (dateCounts[key] || 0) : 0)
      };
  });

  return (
    <DashboardView
      displayName={displayName}
      avatarUrl={user.imageUrl}
      streakDays={dbUser?.streakCount || 0}
      problemsSolved={dbUser?.problemsSolved || 0}
      easySolved={dbUser?.easyCount || 0}
      mediumSolved={dbUser?.mediumCount || 0}
      hardSolved={dbUser?.hardCount || 0}
      rank={dbUser?.rank ? String(dbUser.rank) : "Beginner"}
      heatmap={heatmap}
      weeklyData={weeklyData}
      accuracy={dbUser?.accuracy || 0}
      percentile={dbUser?.percentile || 100}
    />
  );
}