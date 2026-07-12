import { Check, Loader2, Pencil, Tag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface TagCardProps {
	tag: string;
	count: number;
	onDelete?: (tag: string) => void;
	onUpdate?: (oldTag: string, newName: string) => void;
	isDeleting?: boolean;
	isUpdating?: boolean;
}

export function TagCard({
	tag,
	count,
	onDelete,
	onUpdate,
	isDeleting,
	isUpdating,
}: TagCardProps) {
	const [editing, setEditing] = useState(false);
	const [editValue, setEditValue] = useState(tag);

	const handleSave = () => {
		const trimmed = editValue.trim();
		if (trimmed && trimmed !== tag && onUpdate) {
			onUpdate(tag, trimmed);
		}
		setEditing(false);
	};

	const handleCancel = () => {
		setEditValue(tag);
		setEditing(false);
	};

	return (
		<div className="relative group">
			{editing ? (
				<Card className="h-full">
					<CardHeader>
						<div className="flex items-center gap-2">
							<Input
								value={editValue}
								onChange={(e) => setEditValue(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSave();
									if (e.key === "Escape") handleCancel();
								}}
								className="text-lg font-semibold"
								autoFocus
							/>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex gap-2">
							<Button size="sm" onClick={handleSave} disabled={isUpdating}>
								{isUpdating ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Check className="h-4 w-4" />
								)}
								保存
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={handleCancel}
								disabled={isUpdating}
							>
								<X className="h-4 w-4" />
								キャンセル
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<>
					<Link href={`/problems?tag=${encodeURIComponent(tag)}`}>
						<Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<Tag className="h-5 w-5" />
									</div>
									<CardTitle className="text-lg">{tag}</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-2">
									<Badge variant="secondary" className="text-sm">
										{count}件の問題
									</Badge>
								</div>
							</CardContent>
						</Card>
					</Link>
					<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						{onUpdate && (
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-primary"
								onClick={(e) => {
									e.preventDefault();
									setEditValue(tag);
									setEditing(true);
								}}
							>
								<Pencil className="h-4 w-4" />
							</Button>
						)}
						{onDelete && (
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-destructive"
								onClick={(e) => {
									e.preventDefault();
									onDelete(tag);
								}}
								disabled={isDeleting}
							>
								{isDeleting ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Trash2 className="h-4 w-4" />
								)}
							</Button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
