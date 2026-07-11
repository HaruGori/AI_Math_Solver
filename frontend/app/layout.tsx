import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import type React from "react";
import { Suspense } from "react";
import AuthProvider from "@/components/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
	title: "AI 数学ソルバー - 問題を解いて学んで管理する",
	description:
		"数学の問題をアップロードし、AIが解説を作成。タグで整理して効率的に学習できるプラットフォーム。",
	generator: "v0.app",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
				<AuthProvider>
					<ErrorBoundary>
						<Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
					</ErrorBoundary>
				</AuthProvider>
				<Toaster />
				<Analytics />
			</body>
		</html>
	);
}
