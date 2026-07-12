"use client";

import { Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { TagCard } from "@/components/tag-card";
import { problemsApi, tagsApi } from "@/lib/api";

interface TagWithCount {
	id: number;
	tag: string;
	count: number;
}

export default function TagsPage() {
	const [tagStats, setTagStats] = useState<TagWithCount[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [deletingTag, setDeletingTag] = useState<string | null>(null);
	const [updatingTag, setUpdatingTag] = useState<string | null>(null);

	useEffect(() => {
		const fetchTagStats = async () => {
			try {
				setIsLoading(true);
				const [tags, problemsData] = await Promise.all([
					tagsApi.getTags(),
					problemsApi.getProblems({ limit: 1000 }),
				]);

				const tagMap = new Map<
					string,
					{ id: number; tag: string; count: number }
				>();
				for (const t of tags) {
					tagMap.set(t.name, { id: t.id, tag: t.name, count: 0 });
				}

				for (const problem of problemsData.problems) {
					for (const tag of problem.tags) {
						const entry = tagMap.get(tag.name);
						if (entry) entry.count++;
					}
				}

				const tagStatsArray = Array.from(tagMap.values()).sort(
					(a, b) => b.count - a.count,
				);

				setTagStats(tagStatsArray);
			} catch (error) {
				console.error("[v0] Error fetching tag stats:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTagStats();
	}, []);

	const handleUpdateTag = async (oldTag: string, newName: string) => {
		setUpdatingTag(oldTag);
		try {
			const entry = tagStats.find((t) => t.tag === oldTag);
			if (entry) {
				await tagsApi.updateTag(entry.id, newName);
				setTagStats((prev) =>
					prev.map((t) =>
						t.tag === oldTag ? { ...t, tag: newName } : t,
					),
				);
			}
		} catch (error) {
			console.error("Failed to update tag:", error);
		} finally {
			setUpdatingTag(null);
		}
	};

	const handleDeleteTag = async (tag: string) => {
		if (!confirm(`"${tag}" を削除してもよろしいですか？`)) return;
		setDeletingTag(tag);
		try {
			const entry = tagStats.find((t) => t.tag === tag);
			if (entry) {
				await tagsApi.deleteTag(entry.id);
				setTagStats((prev) => prev.filter((t) => t.tag !== tag));
			}
		} catch (error) {
			console.error("Failed to delete tag:", error);
		} finally {
			setDeletingTag(null);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1 py-12 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-2">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Tags className="h-6 w-6" />
							</div>
							<h1 className="text-3xl font-bold tracking-tight text-balance">
								タグ管理
							</h1>
						</div>
						<p className="text-muted-foreground text-pretty leading-relaxed">
							すべてのタグと関連する問題数を確認できます。タグをクリックすると、そのタグの問題一覧が表示されます。
						</p>
					</div>

					{isLoading ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">読み込み中...</p>
						</div>
					) : tagStats.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">
								タグがまだありません。問題を追加してタグを作成しましょう。
							</p>
						</div>
					) : (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{tagStats.map(({ tag, count, id }) => (
								<TagCard
									key={tag}
									tag={tag}
									count={count}
									onDelete={handleDeleteTag}
									onUpdate={handleUpdateTag}
									isDeleting={deletingTag === tag}
									isUpdating={updatingTag === tag}
								/>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
