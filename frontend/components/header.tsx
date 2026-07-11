import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserAuthForm from "@/components/user-auth-form";

export function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<Link
					href="/"
					className="flex items-center gap-2 font-semibold text-lg"
				>
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<BookOpen className="h-5 w-5" />
					</div>
					<span className="text-balance">AI 数学ソルバー</span>
				</Link>

				<nav className="hidden md:flex items-center gap-6">
					<Link
						href="/problems"
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						問題一覧
					</Link>
					<Link
						href="/tags"
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						タグ管理
					</Link>
					<Link
						href="/upload"
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						問題をアップロード
					</Link>
				</nav>

				<div className="flex items-center gap-3">
					<UserAuthForm />
				</div>
			</div>
		</header>
	);
}
