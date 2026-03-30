import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const initialProblems = [
    {
        id: "hello-world", // Mapped from problemId to id
        title: "Hello World",
        description: "Write a program that prints 'Hello, World!' to the console.",
        difficulty: "easy",
        category: "basics",
        tags: ["basics", "output"],
        constraints: "No input required",
        examples: [
            {
                input: "",
                output: "Hello, World!",
                explanation: "Simply print the string 'Hello, World!'"
            }
        ],
        testCases: [
            {
                input: "",
                expectedOutput: "Hello, World!",
                isHidden: false
            }
        ],
        hints: ["Use print() in Python, System.out.println() in Java, or console.log() in JavaScript"]
    },
    {
        id: "sum-two-numbers",
        title: "Sum of Two Numbers",
        description: "Write a program that takes two integers as input and prints their sum.",
        difficulty: "easy",
        category: "basics",
        tags: ["basics", "arithmetic", "input-output"],
        constraints: "Input will be two integers separated by space, range: -10^9 to 10^9",
        examples: [
            {
                input: "5 3",
                output: "8",
                explanation: "5 + 3 = 8"
            },
            {
                input: "-2 7",
                output: "5",
                explanation: "-2 + 7 = 5"
            }
        ],
        testCases: [
            { input: "5 3", expectedOutput: "8", isHidden: false },
            { input: "-2 7", expectedOutput: "5", isHidden: false },
            { input: "0 0", expectedOutput: "0", isHidden: true },
            { input: "1000000000 -1000000000", expectedOutput: "0", isHidden: true }
        ],
        hints: ["Read two integers from input", "Add them together", "Print the result"]
    },
    {
        id: "even-or-odd",
        title: "Even or Odd",
        description: "Write a program that takes an integer as input and determines if it's even or odd.",
        difficulty: "easy",
        category: "basics",
        tags: ["basics", "conditionals", "modular-arithmetic"],
        constraints: "Input will be a single integer, range: -10^9 to 10^9",
        examples: [
            {
                input: "4",
                output: "Even",
                explanation: "4 is divisible by 2, so it's even"
            },
            {
                input: "7",
                output: "Odd",
                explanation: "7 is not divisible by 2, so it's odd"
            }
        ],
        testCases: [
            { input: "4", expectedOutput: "Even", isHidden: false },
            { input: "7", expectedOutput: "Odd", isHidden: false },
            { input: "0", expectedOutput: "Even", isHidden: true },
            { input: "-3", expectedOutput: "Odd", isHidden: true }
        ],
        hints: ["Use the modulo operator (%)", "If number % 2 == 0, it's even", "Otherwise, it's odd"]
    },
    // ... adding a subset for brevity and speed, can add all later if needed
    {
        id: "tic-tac-toe",
        title: "Tic Tac Toe Game",
        description: "Implement a two-player Tic Tac Toe game with a console or GUI interface.",
        difficulty: "real-world",
        category: "games",
        tags: ["games", "logic", "arrays", "real-world"],
        constraints: "3x3 grid, two players, check win conditions",
        examples: [
            {
                input: "Player moves: (0,0), (1,1), (0,1), (1,0), (0,2)",
                output: "Player 1 wins!",
                explanation: "Player 1 gets three X's in the top row"
            }
        ],
        testCases: [
            { input: "1 1\n2 2\n1 2\n2 1\n1 3", expectedOutput: "Player 1 wins!", isHidden: false }
        ],
        hints: ["Use a 3x3 array to represent the board", "Check rows, columns, and diagonals for win conditions"]
    }
];

async function main() {
    console.log('🌱 Seeding database...');

    for (const problem of initialProblems) {
        const { testCases, ...problemData } = problem;

        // Create or update problem
        await db.problem.upsert({
            where: { id: problem.id },
            update: {},
            create: {
                id: problem.id,
                title: problemData.title,
                description: problemData.description,
                difficulty: problemData.difficulty,
                category: problemData.category,
                tags: Array.isArray(problemData.tags) ? problemData.tags : [problemData.tags],
                constraints: problemData.constraints,
                examples: JSON.stringify(problemData.examples),
                hints: JSON.stringify(problemData.hints),
                testCases: {
                    create: testCases.map(tc => ({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        isHidden: tc.isHidden
                    }))
                }
            }
        });
        console.log(`Created problem: ${problem.title}`);
    }
}

main()
    .then(async () => {
        await db.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await db.$disconnect();
        process.exit(1);
    });
