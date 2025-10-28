import { notFound } from 'next/navigation';

// Type definitions
type Tag = {
  id: number;
  name: string;
}

type Problem = {
  id: number;
  title: string;
  content: string;
  solution: string | null;
  tags: Tag[];
};

// Data fetching function
async function getProblem(id: string): Promise<Problem | null> {
  try {
    const res = await fetch(`http://localhost:8000/api/problems/${id}`, {
      cache: 'no-store', // Ensure fresh data on every request
    });

    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch problem:", error);
    return null;
  }
}

// The page component is now async
export default async function ProblemDetail({ params }: { params: { id: string } }) {
  const problem = await getProblem(params.id);

  // If no problem is found, show a 404 page
  if (!problem) {
    notFound();
  }

  return (
    <div>
      <h1>問題詳細</h1>
      <p>
        <strong>問題:</strong> {problem.title}
      </p>
      <p>
        <strong>内容:</strong> {problem.content}
      </p>
      <p>
        <strong>解説:</strong> {problem.solution || "解説はまだありません"}
      </p>
      <p>
        <strong>タグ:</strong> {problem.tags.map(t => t.name).join(", ")}
      </p>
      <a href="/problems" className="text-blue-600 underline">
        ← 戻る
      </a>
    </div>
  );
}
