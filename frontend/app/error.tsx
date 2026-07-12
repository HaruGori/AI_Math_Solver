"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Page error:", error);
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5" />
						<CardTitle className="text-lg">
							予期しないエラーが発生しました
						</CardTitle>
					</div>
					<CardDescription>
						アプリケーションで問題が発生しました。再読み込みをお試しください。
					</CardDescription>
				</CardHeader>
				{error.digest && (
					<CardContent>
						<p className="text-xs text-muted-foreground">
							Error ID: {error.digest}
						</p>
					</CardContent>
				)}
				<CardFooter>
					<Button className="w-full gap-2" onClick={reset}>
						<RefreshCw className="h-4 w-4" />
						再読み込み
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
