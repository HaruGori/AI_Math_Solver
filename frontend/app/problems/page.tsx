"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { ProblemCard } from "@/components/problem-card";
import { ProblemFilters } from "@/components/problem-filters";
import { Button } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { ApiError, type Problem, problemsApi, tagsApi } from "@/lib/api";

const PAGE_SIZE = 12;

export default function ProblemsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const [problems, setProblems] = useState<Problem[]>([]);
	const [total, setTotal] = useState(0);
	const [availableTags, setAvailableTags] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const page = Number(searchParams.get("page")) || 1;
	const search = searchParams.get("search") || "";
	const selectedTag = searchParams.get("tag") || null;

	const totalPages = Math.ceil(total / PAGE_SIZE);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const [problemsData, tagsData] = await Promise.all([
					problemsApi.getProblems({
						skip: (page - 1) * PAGE_SIZE,
						limit: PAGE_SIZE,
						tag: selectedTag || undefined,
						search: search || undefined,
					}),
					tagsApi.getTags(),
				]);
				setProblems(problemsData.problems);
				setTotal(problemsData.total);
				setAvailableTags(tagsData.map((tag) => tag.name));
			} catch (error) {
				console.error("[v0] Error fetching data:", error);
				if (error instanceof ApiError) {
					const messages: Record<string, string> = {
						NETWORK_ERROR:
							"サーバーに接続できませんでした。ネットワークを確認してください。",
						TIMEOUT: "リクエストがタイムアウトしました。",
					};
					toast({
						title: "データの取得に失敗しました",
						description: messages[error.code] || error.message,
						variant: "destructive",
					});
				} else {
					toast({
						title: "データの取得に失敗しました",
						description:
							"問題一覧の読み込みに失敗しました。ページを再読み込みしてください。",
						variant: "destructive",
					});
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [page, search, selectedTag, toast]);

	const handleSearchChange = (value: string) => {
		const params = new URLSearchParams(searchParams);
		if (value) {
			params.set("search", value);
		} else {
			params.delete("search");
		}
		params.set("page", "1");
		router.push(`/problems?${params.toString()}`);
	};

	const handleTagFilter = (tag: string | null) => {
		const params = new URLSearchParams(searchParams);
		if (tag) {
			params.set("tag", tag);
		} else {
			params.delete("tag");
		}
		params.set("page", "1");
		router.push(`/problems?${params.toString()}`);
	};

	const handleDeleteProblem = async (id: number) => {
		try {
			await problemsApi.deleteProblem(id);
			setProblems((prevProblems) => prevProblems.filter((p) => p.id !== id));
			toast({
				title: "問題を削除しました",
			});
		} catch (error) {
			console.error("[v0] Error deleting problem:", error);
			if (error instanceof ApiError) {
				const messages: Record<string, string> = {
					NETWORK_ERROR:
						"サーバーに接続できませんでした。ネットワークを確認してください。",
					TIMEOUT: "リクエストがタイムアウトしました。",
				};
				toast({
					title: "エラーが発生しました",
					description:
						messages[error.code] ||
						error.message ||
						"問題の削除に失敗しました。",
					variant: "destructive",
				});
			} else {
				toast({
					title: "エラーが発生しました",
					description: "問題の削除に失敗しました。",
					variant: "destructive",
				});
			}
		}
	};

	const buildPageUrl = (p: number) => {
		const params = new URLSearchParams(searchParams);
		params.set("page", String(p));
		return `/problems?${params.toString()}`;
	};

	const paginationItems = useMemo(() => {
		const items: (number | "ellipsis")[] = [];
		if (totalPages <= 5) {
			for (let i = 1; i <= totalPages; i++) items.push(i);
		} else {
			items.push(1);
			if (page > 3) items.push("ellipsis");
			for (
				let i = Math.max(2, page - 1);
				i <= Math.min(totalPages - 1, page + 1);
				i++
			) {
				items.push(i);
			}
			if (page < totalPages - 2) items.push("ellipsis");
			items.push(totalPages);
		}
		return items;
	}, [page, totalPages]);

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1 py-12 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h1 className="text-3xl font-bold tracking-tight text-balance mb-2">
								問題一覧
							</h1>
							<p className="text-muted-foreground text-pretty leading-relaxed">
								保存した問題と解説を確認できます。タグで絞り込んで検索してください。
							</p>
						</div>
						<Button asChild className="gap-2">
							<Link href="/upload">
								<Plus className="h-4 w-4" />
								新しい問題
							</Link>
						</Button>
					</div>

					<div className="mb-8">
						<ProblemFilters
							onSearchChange={handleSearchChange}
							onTagFilter={handleTagFilter}
							availableTags={availableTags}
							selectedTag={selectedTag}
							initialSearch={search}
						/>
					</div>

					{isLoading ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">読み込み中...</p>
						</div>
					) : problems.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">
								問題が見つかりませんでした。
							</p>
						</div>
					) : (
						<>
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
								{problems.map((problem) => (
									<ProblemCard
										key={problem.id}
										problem={problem}
										onDelete={handleDeleteProblem}
									/>
								))}
							</div>

							{totalPages > 1 && (
								<div className="mt-8 flex justify-center">
									<Pagination>
										<PaginationContent>
											{page > 1 && (
												<PaginationItem>
													<PaginationPrevious href={buildPageUrl(page - 1)} />
												</PaginationItem>
											)}
											{paginationItems.map((item, i) =>
												item === "ellipsis" ? (
													<PaginationItem key={`e${i}`}>
														<PaginationEllipsis />
													</PaginationItem>
												) : (
													<PaginationItem key={item}>
														<PaginationLink
															href={buildPageUrl(item)}
															isActive={item === page}
														>
															{item}
														</PaginationLink>
													</PaginationItem>
												),
											)}
											{page < totalPages && (
												<PaginationItem>
													<PaginationNext href={buildPageUrl(page + 1)} />
												</PaginationItem>
											)}
										</PaginationContent>
									</Pagination>
								</div>
							)}
						</>
					)}
				</div>
			</main>
		</div>
	);
}
