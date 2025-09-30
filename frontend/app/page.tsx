"use client";
import { useEffect, useState } from "react";

type Problem = {
  id: number;
  text: string;
  explanation: string;
  tags: string[];
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    fetch("/api/")
      .then((res) => res.json())
      .then((data) => setProblems(data));
  }, []);

  return (
    <div>
      <h1>問題一覧</h1>
      <ul>
        {problems.map((p) => (
          <li key={p.id}>
            {p.text} → <a href={`${p.id}`}>詳細</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
