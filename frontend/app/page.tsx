import { FeaturesSection } from "@/components/features-section";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";

export default function HomePage() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1">
				<HeroSection />
				<FeaturesSection />
			</main>
			<footer className="border-t border-border py-8">
				<div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
					<p>© 2025 AI 数学ソルバー. すべての権利を保有します。</p>
				</div>
			</footer>
		</div>
	);
}
