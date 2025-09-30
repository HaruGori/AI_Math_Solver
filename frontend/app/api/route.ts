import { NextResponse } from "next/server";

const problems = [
  {
    id: 1,
    text: "x^2 + 2x + 1 = 0 を解け",
    explanation: "解は x = -1",
    tags: ["二次方程式"],
  },
  {
    id: 2,
    text: "3の2乗は？",
    explanation: "答えは9",
    tags: ["算数","平方根"],
  }
];

export async function GET() {
  return NextResponse.json(problems);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newProblem = { id: Date.now(), ...body };
  problems.push(newProblem);
  return NextResponse.json(newProblem);
}
