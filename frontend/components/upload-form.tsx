"use client";

import { FileText, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { ImageUpload } from "@/components/image-upload";
import { SolutionDisplay } from "@/components/solution-display"; // Import SolutionDisplay
import { TagInput } from "@/components/tag-input";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ApiError, problemsApi, tagsApi, uploadApi } from "@/lib/api";

export function UploadForm() {
	const router = useRouter();
	const { toast } = useToast();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [image, setImage] = useState<File | null>(null);
	const [tags, setTags] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState<"image" | "text">("image");
	const [aiAnswer, setAiAnswer] = useState<string | null>(null); // New state for AI solution
	const [uploadedProblemId, setUploadedProblemId] = useState<number | null>(
		null,
	); // New state for problem ID

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setAiAnswer(null); // Clear previous solution
		setUploadedProblemId(null); // Clear previous problem ID

		try {
			let imageUrl: string | undefined;
			let content = description;

			// 画像タブの場合、画像をアップロード
			if (activeTab === "image" && image) {
				const uploadResult = await uploadApi.uploadImage(image);
				imageUrl = uploadResult.url;
				content = description || "画像から問題を解析";
			}

			// タグを作成または取得
			const existingTags = await tagsApi.getTags();
			const tagIds: number[] = [];

			for (const tagName of tags) {
				const existingTag = existingTags.find((t) => t.name === tagName);
				if (existingTag) {
					tagIds.push(existingTag.id);
				} else {
					const newTag = await tagsApi.createTag(tagName);
					tagIds.push(newTag.id);
				}
			}

			// 問題を作成
			const problem = await problemsApi.createProblem({
				title,
				content,
				content_type: activeTab,
				image_url: imageUrl,
				tag_ids: tagIds,
			});

			// AI解説を生成
			await problemsApi.generateAnswer(problem.id);

			// Fetch the problem again to get the generated answer
			const fetchedProblem = await problemsApi.getProblem(problem.id);
			setAiAnswer(fetchedProblem.answer || null); // Set AI solution
			setUploadedProblemId(fetchedProblem.id); // Set problem ID

			toast({
				title: "問題を保存しました",
				description: "AI解説を生成しました。",
			});

			// Remove router.push here
			// router.push(`/problems/${problem.id}`)
		} catch (error) {
			console.error("[v0] Error submitting form:", error);
			if (error instanceof ApiError) {
				const messages: Record<string, string> = {
					RATE_LIMIT_EXCEEDED:
						"AIサービスのレート制限に達しました。時間をおいて再試行してください。",
					AI_SERVICE_UNAVAILABLE:
						"AIサービスに接続できませんでした。ネットワークを確認してください。",
					AI_SERVICE_ERROR:
						"AIサービスでエラーが発生しました。時間をおいて再試行してください。",
					NETWORK_ERROR:
						"サーバーに接続できませんでした。ネットワークを確認してください。",
					TIMEOUT:
						"リクエストがタイムアウトしました。ネットワークを確認してください。",
					VALIDATION_ERROR: "入力値が不正です。入力内容を確認してください。",
				};
				toast({
					title: "エラーが発生しました",
					description:
						messages[error.code] ||
						error.message ||
						"問題の保存に失敗しました。もう一度お試しください。",
					variant: "destructive",
				});
			} else {
				toast({
					title: "エラーが発生しました",
					description: "問題の保存に失敗しました。もう一度お試しください。",
					variant: "destructive",
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="title">問題のタイトル</Label>
				<Input
					id="title"
					placeholder="例: 二次方程式の解の公式"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>

			<Tabs
				defaultValue="image"
				className="w-full"
				onValueChange={(v) => setActiveTab(v as "image" | "text")}
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="image" className="gap-2">
						<Upload className="h-4 w-4" />
						画像アップロード
					</TabsTrigger>
					<TabsTrigger value="text" className="gap-2">
						<FileText className="h-4 w-4" />
						テキスト入力
					</TabsTrigger>
				</TabsList>

				<TabsContent value="image" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">
								問題の画像をアップロード
							</CardTitle>
							<CardDescription>
								写真を撮るか、既存の画像をアップロードしてください
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ImageUpload onImageChange={setImage} value={image} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="text" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">問題をテキストで入力</CardTitle>
							<CardDescription>問題文を直接入力してください</CardDescription>
						</CardHeader>
						<CardContent>
							<Textarea
								placeholder="例: x² + 5x + 6 = 0 を解け"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={8}
								className="font-mono"
							/>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<div className="space-y-2">
				<Label>タグ</Label>
				<TagInput tags={tags} onTagsChange={setTags} />
			</div>

			<Card className="bg-primary/5 border-primary/20">
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<Sparkles className="h-5 w-5" />
						</div>
						<div className="flex-1">
							<h3 className="font-semibold mb-1">AI解説生成</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								問題を保存すると、AIが自動的に詳しい解説を生成します。解説は後から編集することもできます。
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{aiAnswer && (
				<div className="space-y-4">
					<h3 className="text-xl font-bold">AI解析結果</h3>
					<SolutionDisplay solution={aiAnswer} />
					{uploadedProblemId && (
						<Button asChild className="w-full">
							<Link href={`/problems/${uploadedProblemId}`}>
								問題詳細を見る
							</Link>
						</Button>
					)}
				</div>
			)}

			<div className="flex gap-3">
				<Button
					type="button"
					variant="outline"
					className="flex-1 bg-transparent"
					onClick={() => router.push("/")}
				>
					キャンセル
				</Button>
				<Button
					type="submit"
					className="flex-1 gap-2"
					disabled={isSubmitting || !title}
				>
					{isSubmitting ? (
						"処理中..."
					) : (
						<>
							<Upload className="h-4 w-4" />
							問題を保存
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
