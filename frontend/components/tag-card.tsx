import { Loader2, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TagCardProps {
	tag: string;
	count: number;
	onDelete?: (tag: string) => void;
	isDeleting?: boolean;
}

export function TagCard({ tag, count, onDelete, isDeleting }: TagCardProps) {
	return (
		<div className="relative group">
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
			{onDelete && (
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
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
	);
}
