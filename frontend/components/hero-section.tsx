import { ArrowRight, BookOpen, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
	return (
		<section className="relative overflow-hidden py-20 md:py-28">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl mb-6">
						数学の問題を
						<span className="text-primary">解いて</span>
						<br />
						<span className="text-secondary">学んで</span>
						管理する
					</h1>
					<p className="text-lg text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto leading-relaxed">
						写真や文章で問題をアップロードし、AIが解説を作成。タグで整理して、いつでも見返せる学習プラットフォーム。
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button asChild size="lg" className="gap-2 text-base">
							<Link href="/upload">
								<Upload className="h-5 w-5" />
								問題をアップロード
								<ArrowRight className="h-5 w-5" />
							</Link>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="gap-2 text-base bg-transparent"
						>
							<Link href="/problems">
								<BookOpen className="h-5 w-5" />
								問題を見る
							</Link>
						</Button>
					</div>
				</div>

				{/* 数学的な装飾要素 */}
				<div className="absolute top-10 left-10 text-6xl font-mono text-primary/10 select-none pointer-events-none">
					$$\sum$$
				</div>
				<div className="absolute bottom-10 right-10 text-6xl font-mono text-secondary/10 select-none pointer-events-none">
					$$\int$$
				</div>
				<div className="absolute top-1/2 left-1/4 text-4xl font-mono text-primary/5 select-none pointer-events-none">
					$$\pi$$
				</div>
			</div>
		</section>
	);
}
