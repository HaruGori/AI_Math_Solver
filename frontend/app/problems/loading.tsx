import { Skeleton } from "@/components/ui/skeleton";

export default function ProblemsLoading() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 space-y-6">
				<Skeleton className="h-8 w-48" />
				<div className="flex gap-4">
					<Skeleton className="h-10 flex-1" />
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="border rounded-lg p-4 space-y-3">
							<Skeleton className="h-5 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-1/2" />
							<div className="flex gap-2 pt-2">
								<Skeleton className="h-5 w-16 rounded-full" />
								<Skeleton className="h-5 w-12 rounded-full" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
