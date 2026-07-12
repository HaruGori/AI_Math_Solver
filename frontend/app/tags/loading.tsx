import { Skeleton } from "@/components/ui/skeleton";

export default function TagsLoading() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 space-y-6">
				<Skeleton className="h-8 w-32" />
				<div className="flex gap-2 flex-wrap">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="h-10 w-28 rounded-full" />
					))}
				</div>
			</div>
		</div>
	);
}
