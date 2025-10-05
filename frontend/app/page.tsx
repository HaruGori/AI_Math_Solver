"use client";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">AI Math Solver</h1>

      <div className="flex flex-col gap-4">
        <a
          href="/problems"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        >
          問題一覧へ
        </a>
        <a
          href="/upload"
          className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          アップロードへ
        </a>
      </div>
    </main>
  );
}
