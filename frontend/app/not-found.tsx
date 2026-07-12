import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2 text-muted-foreground">
						<FileQuestion className="h-5 w-5" />
						<CardTitle className="text-lg">ページが見つかりません</CardTitle>
					</div>
					<CardDescription>
						お探しのページは存在しないか、移動または削除された可能性があります。
					</CardDescription>
				</CardHeader>
				<CardFooter>
					<Button className="w-full" asChild>
						<Link href="/">トップページに戻る</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
