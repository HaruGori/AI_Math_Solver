"use client";

import { ArrowLeft, Calendar, Edit3, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { SolutionDisplay } from "@/components/solution-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { type Problem, problemsApi } from "@/lib/api";

export default function ProblemDetailPage() {
	const params = useParams();
	const id = params.id as string;
	const [problem, setProblem] = useState<Problem | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [notFoundError, setNotFoundError] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const fetchProblem = async () => {
			try {
				setIsLoading(true);
				const data = await problemsApi.getProblem(Number(id));
				setProblem(data);
				setEditText(data.answer || "");
			} catch (error) {
				console.error("[v0] Error fetching problem:", error);
				setNotFoundError(true);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProblem();
	}, [id]);

	const handleGenerate = async () => {
		if (!problem) return;
		setIsGenerating(true);
		try {
			const { answer } = await problemsApi.generateAnswer(problem.id);
			setProblem({ ...problem, answer });
			setEditText(answer);
		} catch (error) {
			console.error("Failed to generate solution:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleStartEdit = () => {
		setEditText(problem?.answer || "");
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditText(problem?.answer || "");
	};

	const handleSaveEdit = async () => {
		if (!problem) return;
		setIsSaving(true);
		try {
			const updated = await problemsApi.updateProblem(problem.id, {
				answer: editText,
			});
			setProblem(updated);
			setIsEditing(false);
		} catch (error) {
			console.error("Failed to update solution:", error);
		} finally {
			setIsSaving(false);
		}
	};

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

						{problem.answer && !isEditing && (
							<div className="relative">
								<SolutionDisplay solution={problem.answer} />
								<Button
									variant="outline"
									size="sm"
									className="absolute top-4 right-4 gap-2"
									onClick={handleStartEdit}
								>
									<Edit3 className="h-4 w-4" />
									編集
								</Button>
							</div>
						)}

						{isEditing && (
							<Card className="border-primary/20">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-xl">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
											<Sparkles className="h-4 w-4" />
										</div>
										AI生成の解説（編集中）
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<Textarea
										value={editText}
										onChange={(e) => setEditText(e.target.value)}
										className="min-h-[200px] font-mono text-sm"
									/>
									<div className="flex gap-2 justify-end">
										<Button
											variant="outline"
											onClick={handleCancelEdit}
											disabled={isSaving}
										>
											キャンセル
										</Button>
										<Button onClick={handleSaveEdit} disabled={isSaving}>
											{isSaving ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													保存中...
												</>
											) : (
												"保存"
											)}
										</Button>
									</div>
								</CardContent>
							</Card>
						)}

						{!problem.answer && !isEditing && (
							<div className="flex justify-center">
								<Button
									size="lg"
									className="gap-2"
									onClick={handleGenerate}
									disabled={isGenerating}
								>
									{isGenerating ? (
										<>
											<Loader2 className="h-5 w-5 animate-spin" />
											解説を生成中...
										</>
									) : (
										<>
											<Sparkles className="h-5 w-5" />
											AIで解説を生成
										</>
									)}
								</Button>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
