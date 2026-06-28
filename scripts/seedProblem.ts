import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const problem = await prisma.problem.create({
    data: {
      title: "Add Two Numbers (Beginner)",
      description: "Write a program that reads two integers from standard input (one on each line) and prints their sum to standard output.",
      difficulty: "easy",
      category: "Math",
      tags: ["beginner", "math", "basics"],
      constraints: "-10^4 <= a, b <= 10^4",
      examples: JSON.stringify([
        { input: "5\n7", output: "12", explanation: "5 + 7 = 12" },
        { input: "-3\n10", output: "7", explanation: "-3 + 10 = 7" }
      ]),
      hints: JSON.stringify([
        "Read the inputs carefully depending on your language.", 
        "In Python, use input(). In C++, use cin."
      ]),
      testCases: {
        create: [
          { input: "5\n7\n", expectedOutput: "12\n", isHidden: false },
          { input: "-3\n10\n", expectedOutput: "7\n", isHidden: false },
          { input: "0\n0\n", expectedOutput: "0\n", isHidden: true },
          { input: "10000\n10000\n", expectedOutput: "20000\n", isHidden: true }
        ]
      }
    },
  });
  console.log('Successfully created beginner problem with ID:', problem.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
