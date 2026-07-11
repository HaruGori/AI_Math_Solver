"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ProblemFiltersProps {
	onSearchChange: (search: string) => void;
	onTagFilter: (tag: string | null) => void;
	availableTags: string[];
	selectedTag: string | null;
}

export function ProblemFilters({
	onSearchChange,
	onTagFilter,
	availableTags,
	selectedTag,
}: ProblemFiltersProps) {
	const [search, setSearch] = useState("");

	const handleSearchChange = (value: string) => {
		setSearch(value);
		onSearchChange(value);
	};

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					type="text"
					placeholder="問題を検索..."
					value={search}
					onChange={(e) => handleSearchChange(e.target.value)}
					className="pl-10"
				/>
			</div>

			<div className="flex flex-wrap gap-2">
				<Badge
					variant={selectedTag === null ? "default" : "outline"}
					className="cursor-pointer"
					onClick={() => onTagFilter(null)}
				>
					すべて
				</Badge>
				{availableTags.map((tag) => (
					<Badge
						key={tag}
						variant={selectedTag === tag ? "default" : "outline"}
						className="cursor-pointer gap-1"
						onClick={() => onTagFilter(tag)}
					>
						{tag}
						{selectedTag === tag && <X className="h-3 w-3" />}
					</Badge>
				))}
			</div>
		</div>
	);
}
