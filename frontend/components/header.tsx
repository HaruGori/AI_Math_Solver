import { BookOpen, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import UserAuthForm from "@/components/user-auth-form";

const navLinks = [
	{ href: "/problems", label: "問題一覧" },
	{ href: "/tags", label: "タグ管理" },
	{ href: "/upload", label: "問題をアップロード" },
];

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
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-3">
					<UserAuthForm />
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="md:hidden"
							>
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right">
							<SheetTitle className="sr-only">メニュー</SheetTitle>
							<nav className="flex flex-col gap-4 mt-8">
								{navLinks.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</Link>
								))}
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
