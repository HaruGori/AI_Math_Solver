import { Header } from "@/components/header";
import { UploadForm } from "@/components/upload-form";

export default function UploadPage() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1 py-12 bg-muted/30">
				<div className="container mx-auto px-4 max-w-3xl">
					<div className="mb-8">
						<h1 className="text-3xl font-bold tracking-tight text-balance mb-2">
							新しい問題を追加
						</h1>
						<p className="text-muted-foreground text-pretty leading-relaxed">
							画像をアップロードするか、テキストで問題を入力してください。AIが自動的に解説を生成します。
						</p>
					</div>
					<UploadForm />
				</div>
			</main>
		</div>
	);
}
