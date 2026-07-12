import { Skeleton } from "@/components/ui/skeleton";

export default function ProblemDetailLoading() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 space-y-6">
				<Skeleton className="h-6 w-24" />
				<div className="space-y-4">
					<Skeleton className="h-8 w-2/3" />
					<div className="border rounded-lg p-6 space-y-3">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
						<Skeleton className="h-4 w-3/4" />
					</div>
					<div className="border rounded-lg p-6 space-y-3">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-4/5" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				</div>
			</div>
		</div>
	);
}
