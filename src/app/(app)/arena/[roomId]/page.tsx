import { api } from "~/trpc/server";
import { ArenaWorkspace } from "~/_components/arena/ArenaWorkspace";
import { notFound } from "next/navigation";

export default async function ArenaRoomPage(
    props: { params: Promise<{ roomId: string }> }
) {
    const params = await props.params;
    
    // Fetch room details
    const room = await api.arena.getRoom({ roomId: params.roomId });
    
    if (!room) {
        notFound();
    }

    // For ponytail mode: Just grabbing the first problem for the room
    const problems = room.problems;
    
    if (!problems || problems.length === 0) {
        return <div className="text-white p-8">No problems assigned to this room yet!</div>;
    }

    return (
        <main className="h-screen bg-[#06080d] text-slate-100 flex flex-col overflow-hidden">


            {/* Workspace Area */}
            <ArenaWorkspace 
                problems={problems} 
                roomId={room.roomId}
                matchType={room.matchType}
                timeLimit={room.timeLimit}
                startedAt={room.startedAt?.toISOString()}
                initialMatchStatus={room.status}
                penaltyType={room.penaltyType}
                hideTestCases={room.hideTestCases}
                blindMode={room.blindMode}
                bonusMarks={room.bonusMarks}
            />
        </main>
    );
}
