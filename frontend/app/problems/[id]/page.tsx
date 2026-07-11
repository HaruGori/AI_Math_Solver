"use client";

import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { SolutionDisplay } from "@/components/solution-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Problem, problemsApi } from "@/lib/api";

export default function ProblemDetailPage() {
	const params = useParams();
	const id = params.id as string;
	const [problem, setProblem] = useState<Problem | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [notFoundError, setNotFoundError] = useState(false);

	useEffect(() => {
		const fetchProblem = async () => {
			try {
				setIsLoading(true);
				const data = await problemsApi.getProblem(Number(id));
				setProblem(data);
			} catch (error) {
				console.error("[v0] Error fetching problem:", error);
				setNotFoundError(true);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProblem();
	}, [id]);

	if (notFoundError) {
		notFound();
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-1 py-12 bg-muted/30">
					<div className="container mx-auto px-4 max-w-4xl">
						<div className="text-center py-12">
							<p className="text-muted-foreground">読み込み中...</p>
						</div>
					</div>
				</main>
			</div>
		);
	}

	if (!problem) {
		return null;
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1 py-12 bg-muted/30">
				<div className="container mx-auto px-4 max-w-4xl">
					<Button asChild variant="ghost" className="mb-6 gap-2 bg-transparent">
						<Link href="/problems">
							<ArrowLeft className="h-4 w-4" />
							問題一覧に戻る
						</Link>
					</Button>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<CardTitle className="text-2xl text-balance mb-3">
											{problem.title}
										</CardTitle>
										<div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
											<Calendar className="h-4 w-4" />
											{new Date(problem.created_at).toLocaleDateString("ja-JP")}
										</div>
										<div className="flex flex-wrap gap-2">
											{problem.tags.map((tag) => (
												<Badge key={tag.id} variant="secondary">
													{tag.name}
												</Badge>
											))}
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<h3 className="font-semibold mb-2">問題</h3>
										{problem.content_type === "image" && problem.image_url && (
											<div className="mb-4">
												<img
													src={problem.image_url || "/placeholder.svg"}
													alt={problem.title}
													className="max-w-full h-auto rounded-lg border"
												/>
											</div>
										)}
										<div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
											{problem.content}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{problem.answer && <SolutionDisplay solution={problem.answer} />}
					</div>
				</div>
			</main>
		</div>
	);
}
