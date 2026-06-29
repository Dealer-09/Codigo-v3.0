import { userRouter } from "~/server/api/routers/user";
import { problemRouter } from "~/server/api/routers/problem";
import { aiRouter } from "~/server/api/routers/ai";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { arenaRouter } from "~/server/api/routers/arena";
import { executionRouter } from "~/server/api/routers/execution";
import { contestRouter } from "~/server/api/routers/contest";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  problem: problemRouter,
  ai: aiRouter,
  arena: arenaRouter,
  execution: executionRouter,
  contest: contestRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
