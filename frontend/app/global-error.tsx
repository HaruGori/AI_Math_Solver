"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js convention
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="ja">
			<body className="font-sans">
				<div className="min-h-screen flex items-center justify-center p-4">
					<div className="w-full max-w-md text-center space-y-4">
						<div className="flex justify-center text-destructive">
							<AlertTriangle className="h-12 w-12" />
						</div>
						<h1 className="text-xl font-bold">重大なエラーが発生しました</h1>
						<p className="text-muted-foreground text-sm">
							アプリケーションの起動中に問題が発生しました。
							しばらく待ってから再読み込みをお試しください。
						</p>
						{error.digest && (
							<p className="text-xs text-muted-foreground">
								Error ID: {error.digest}
							</p>
						)}
						<Button className="gap-2" onClick={reset}>
							<RefreshCw className="h-4 w-4" />
							再読み込み
						</Button>
					</div>
				</div>
			</body>
		</html>
	);
}
