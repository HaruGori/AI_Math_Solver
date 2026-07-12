"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ProblemFiltersProps {
	onSearchChange: (search: string) => void;
	onTagFilter: (tag: string | null) => void;
	availableTags: string[];
	selectedTag: string | null;
	initialSearch?: string;
}

export function ProblemFilters({
	onSearchChange,
	onTagFilter,
	availableTags,
	selectedTag,
	initialSearch,
}: ProblemFiltersProps) {
	const [search, setSearch] = useState(initialSearch || "");
	const debounceRef = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => {
		setSearch(initialSearch || "");
	}, [initialSearch]);

	const handleSearchChange = (value: string) => {
		setSearch(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => onSearchChange(value), 300);
	};

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, []);

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
