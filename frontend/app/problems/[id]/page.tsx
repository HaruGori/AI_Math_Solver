"use client";
import { useEffect, useState } from "react";

type Problem = {
  id: number;
  text: string;
  explanation: string;
  tags: string[];
};

export default function ProblemDetail({
  params,
}: {
  params: { id: string };
}) {
  const [problem, setProblem] = useState<Problem | null>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`http://localhost:5001/api/problems/${params.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Problem not found");
        }
        return res.json();
      })
      .then((data: Problem) => {
        setProblem(data);
      })
      .catch(() => {
        setProblem(null);
      });
  }, [params.id]);

  if (!problem) {
    return <div>問題が見つかりません。</div>;
  }

  return (
    <div>
      <h1>問題詳細</h1>
      <p>
        <strong>問題:</strong> {problem.text}
      </p>
      <p>
        <strong>解説:</strong> {problem.explanation}
      </p>
      <p>
        <strong>タグ:</strong> {problem.tags.join(", ")}
      </p>
      <a href="/" className="text-blue-600 underline">
        ← 戻る
      </a>
    </div>
  );
}
