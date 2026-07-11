import { BookOpen, Sparkles, Tags, Upload } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const features = [
	{
		icon: Upload,
		title: "簡単アップロード",
		description:
			"写真を撮るか、文章で入力するだけ。数学の問題を素早く登録できます。",
	},
	{
		icon: Sparkles,
		title: "AI解説生成",
		description:
			"AIが問題を分析し、わかりやすい解説を自動生成。学習をサポートします。",
	},
	{
		icon: Tags,
		title: "タグで整理",
		description: "分野や難易度でタグ付け。必要な問題をすぐに見つけられます。",
	},
	{
		icon: BookOpen,
		title: "いつでも復習",
		description:
			"保存した問題と解説はいつでも閲覧可能。効率的な復習をサポートします。",
	},
];

export function FeaturesSection() {
	return (
		<section className="py-20 bg-muted/30">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl mb-4">
						学習を加速する機能
					</h2>
					<p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
						数学の学習に必要な機能を、シンプルで使いやすいインターフェースで提供します。
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
					{features.map((feature, index) => (
						<Card
							key={index}
							className="border-border hover:border-primary/50 transition-colors"
						>
							<CardHeader>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
									<feature.icon className="h-6 w-6" />
								</div>
								<CardTitle className="text-xl">{feature.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-base leading-relaxed">
									{feature.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
