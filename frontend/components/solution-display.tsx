"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SolutionDisplayProps {
	solution: string;
}

export function SolutionDisplay({ solution }: SolutionDisplayProps) {
	return (
		<Card className="border-primary/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Sparkles className="h-4 w-4" />
					</div>
					AI生成の解説
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="prose prose-sm max-w-none dark:prose-invert">
					{solution.split("\n\n").map((paragraph, index) => {
						if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
							return (
								<h3 key={index} className="font-semibold text-base mt-4 mb-2">
									{paragraph.replace(/\*\*/g, "")}
								</h3>
							);
						}
						if (paragraph.startsWith("$$") && paragraph.endsWith("$$")) {
							return (
								<div
									key={index}
									className="my-4 text-center font-mono text-sm bg-muted/50 p-4 rounded-lg"
								>
									{paragraph}
								</div>
							);
						}
						if (paragraph.startsWith("- ")) {
							return (
								<ul
									key={index}
									className="list-disc list-inside space-y-1 my-2"
								>
									{paragraph.split("\n").map((item, i) => (
										<li key={i} className="text-sm leading-relaxed">
											{item.replace(/^- /, "")}
										</li>
									))}
								</ul>
							);
						}
						return (
							<p key={index} className="text-sm leading-relaxed my-2">
								{paragraph}
							</p>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
