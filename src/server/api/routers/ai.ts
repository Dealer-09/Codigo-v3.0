import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenerativeModel(apiKey: string, modelName?: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName || "gemini-3.5-flash" });
}

function handleAIError(error: any) {
    console.error("AI Error:", error);
    const isOverloaded = error.message?.includes("503") || error.message?.includes("high demand");
    return isOverloaded 
        ? "Google AI is currently overloaded with high demand (503). Please try again in a moment." 
        : "Failed to communicate with AI. Check server configurations.";
}

export const aiRouter = createTRPCRouter({
    analyzeCode: protectedProcedure
        .input(z.object({
            code: z.string(),
            language: z.string(),
            problemId: z.string(),
            apiKey: z.string().min(1, "API Key is required for BYOK"),
            aiModel: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const problem = await ctx.db.problem.findUnique({ where: { id: input.problemId } });
            if (!problem) return { status: "error", message: "Problem not found" };

            // Guardrail: Only allow AI assistance for easy problems
            if (problem.difficulty !== "easy") {
                return { status: "error", message: "AI Sensei is only available for Easy difficulty problems." };
            }

            try {
                const model = getGenerativeModel(input.apiKey, input.aiModel);

                const prompt = `
            You are an expert Competitive Programming AI Assistant.
            
            Problem Title: ${problem.title}
            Description: ${problem.description}
            Constraints: ${problem.constraints || "N/A"}
            Examples/Test Cases: ${JSON.stringify(problem.examples)}
            
            User's ${input.language} Code:
            ${input.code}
            
            INSTRUCTIONS:
            1. Validate the core algorithm against the problem description and test cases.
            2. Ignore standard competitive programming I/O boilerplate (e.g., sys.stdin.read, scanner classes, fs.readFileSync). Do NOT penalize or critique I/O methods unless they fundamentally break the solution.
            3. Point out logical errors, edge cases missed, or time/space complexity issues.
            4. Keep feedback very concise and actionable.
            
            Return a JSON object EXACTLY in this format: 
            { "status": "success", "feedback": ["point 1", "point 2"], "correctedCode": "optional string" }
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
            } catch (error: any) {
                return { status: "error", message: handleAIError(error) };
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
            aiModel: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const problem = await ctx.db.problem.findUnique({ where: { id: input.problemId } });
            if (!problem) return { feedback: "Problem not found" };

            if (problem.difficulty !== "easy") {
                return { feedback: "AI Test Analysis is only available for Easy problems." };
            }

            try {
                const model = getGenerativeModel(input.apiKey, input.aiModel);

                const prompt = `
            You are an expert Competitive Programming AI Assistant.
            
            Problem Title: "${problem.title}"
            The user submitted ${input.language} code that failed a test case.
            
            Code:
            ${input.code}
            
            Failed Input: ${input.failedInput}
            Expected Output: ${input.expectedOutput}
            Actual Output: ${input.actualOutput}
            Error Message: ${input.errorMessage || "None"}
            
            INSTRUCTIONS:
            1. Explain concisely why the code failed this specific test case and give a hint to fix it. Do not just give the complete answer.
            2. Ignore standard competitive programming I/O boilerplate (e.g., sys.stdin.read, scanner classes, fs.readFileSync). Do NOT penalize or critique I/O methods.
            3. Focus entirely on the logical flaw that caused the wrong output or runtime error.
            `;

                const result = await model.generateContent(prompt);
                return { feedback: result.response.text() };
            } catch (error: any) {
                return { feedback: handleAIError(error) };
            }
        }),

    getHint: protectedProcedure
        .input(z.object({
            problemId: z.string(),
            currentCode: z.string().optional(),
            apiKey: z.string().min(1, "API Key is required for BYOK"),
            aiModel: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const problem = await ctx.db.problem.findUnique({ where: { id: input.problemId } });
            if (!problem) return { hint: "Problem not found" };

            if (problem.difficulty !== "easy") {
                return { hint: "AI Hints are only available for Easy problems." };
            }

            const model = getGenerativeModel(input.apiKey, input.aiModel);

            const prompt = `
        Provide a helpful hint for solving: "${problem.title}".
        Description: ${problem.description}
        ${input.currentCode ? `User's current code context:\n${input.currentCode}` : ""}
        
        Don't solve it completely, just nudge the user in the right direction. Keep it under 2 sentences.
        `;

            try {
                const result = await model.generateContent(prompt);
                return { hint: result.response.text() };
            } catch (error: any) {
                return { hint: handleAIError(error) };
            }
        }),
});
