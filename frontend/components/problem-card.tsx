import { Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Problem } from "@/lib/api";

interface ProblemCardProps {
	problem: Problem;
	onDelete: (id: number) => void;
}

export function ProblemCard({ problem, onDelete }: ProblemCardProps) {
	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onDelete(problem.id);
	};

	return (
		<Card className="h-full flex flex-col">
			<Link href={`/problems/${problem.id}`} className="flex-grow">
				<CardHeader>
					<CardTitle className="text-xl text-balance">
						{problem.title}
					</CardTitle>
					<CardDescription className="flex items-center gap-2 text-xs">
						<Calendar className="h-3 w-3" />
						{new Date(problem.created_at).toLocaleDateString("ja-JP")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
						{problem.content}
					</p>
					{problem.answer && (
						<div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							<h4 className="font-semibold mb-1">AI解説:</h4>
							<p className="line-clamp-2">{problem.answer}</p>
						</div>
					)}
					<div className="flex flex-wrap gap-2">
						{problem.tags.map((tag) => (
							<Badge key={tag.id} variant="secondary" className="text-xs">
								{tag.name}
							</Badge>
						))}
					</div>
				</CardContent>
			</Link>
			<CardFooter className="flex justify-end">
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent onClick={(e) => e.stopPropagation()}>
						<AlertDialogHeader>
							<AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
							<AlertDialogDescription>
								この操作は元に戻せません。問題「{problem.title}
								」を完全に削除します。
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>キャンセル</AlertDialogCancel>
							<AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardFooter>
		</Card>
	);
}
