import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const aiRouter = createTRPCRouter({
    analyzeCode: protectedProcedure
        .input(z.object({
            code: z.string(),
            language: z.string(),
            problemId: z.string(),
            apiKey: z.string().min(1, "API Key is required for BYOK"),
        }))
        .mutation(async ({ ctx, input }) => {
            const problem = await ctx.db.problem.findUnique({ where: { id: input.problemId } });
            if (!problem) return { status: "error", message: "Problem not found" };

            // Guardrail: Only allow AI assistance for easy problems
            if (problem.difficulty !== "easy") {
                return { status: "error", message: "AI Sensei is only available for Easy difficulty problems." };
            }

            try {
                const genAI = new GoogleGenerativeAI(input.apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `
            Analyze this ${input.language} code for the following problem:
            "${problem.description}"
            
            Code:
            ${input.code}
            
            Provide specific feedback, pointing out errors or inefficiencies. Keep it very concise.
            Return a JSON object with: { "status": "success", "feedback": ["point 1", "point 2"], "correctedCode": "optional string" }
            `;

                const result = await model.generateContent(prompt);
                const text = result.response.text();

                try {
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]);
                    }
                    return { status: "success", feedback: [text] }; 
                } catch (e) {
                    return { status: "success", feedback: [text] };
                }
            } catch (error) {
                console.error("AI Error:", error);
                return { status: "error", message: "Failed to analyze code. Check your API Key." };
            }
        }),

    analyzeTestFailure: protectedProcedure
        .input(z.object({
            code: z.string(),
            language: z.string(),
            problemId: z.string(),
            failedInput: z.string(),
            expectedOutput: z.string(),
            actualOutput: z.string(),
            errorMessage: z.string().optional(),
            apiKey: z.string().min(1, "API Key is required for BYOK"),
        }))
        .mutation(async ({ ctx, input }) => {
            const problem = await ctx.db.problem.findUnique({ where: { id: input.problemId } });
            if (!problem) return { feedback: "Problem not found" };

            if (problem.difficulty !== "easy") {
                return { feedback: "AI Test Analysis is only available for Easy problems." };
            }

            try {
                const genAI = new GoogleGenerativeAI(input.apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `
            The user submitted ${input.language} code for the problem: "${problem.title}".
            Their code failed a test case.
            
            Code:
            ${input.code}
            
            Failed Input: ${input.failedInput}
            Expected Output: ${input.expectedOutput}
            Actual Output: ${input.actualOutput}
            Error Message: ${input.errorMessage || "None"}
            
            Explain concisely why the code failed this specific test case and give a hint to fix it. Do not just give the complete answer.
            `;

                const result = await model.generateContent(prompt);
                return { feedback: result.response.text() };
            } catch (e) {
                return { feedback: "Failed to analyze test failure. Check your API Key." };
            }
        }),

    getHint: protectedProcedure
        .input(z.object({
            problemId: z.string(),
            currentCode: z.string().optional(),
            apiKey: z.string().min(1, "API Key is required for BYOK"),
        }))
        .mutation(async ({ ctx, input }) => {
            const problem = await ctx.db.problem.findUnique({ where: { id: input.problemId } });
            if (!problem) return { hint: "Problem not found" };

            if (problem.difficulty !== "easy") {
                return { hint: "AI Hints are only available for Easy problems." };
            }

            const genAI = new GoogleGenerativeAI(input.apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
        Provide a helpful hint for solving: "${problem.title}".
        Description: ${problem.description}
        ${input.currentCode ? `User's current code context:\n${input.currentCode}` : ""}
        
        Don't solve it completely, just nudge the user in the right direction. Keep it under 2 sentences.
        `;

            try {
                const result = await model.generateContent(prompt);
                return { hint: result.response.text() };
            } catch (e) {
                return { hint: "Failed to get hint." };
            }
        }),
});
