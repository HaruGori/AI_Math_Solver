"use client";

import { X } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface TagInputProps {
	tags: string[];
	onTagsChange: (tags: string[]) => void;
}

export function TagInput({ tags, onTagsChange }: TagInputProps) {
	const [inputValue, setInputValue] = useState("");

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim()) {
			e.preventDefault();
			if (!tags.includes(inputValue.trim())) {
				onTagsChange([...tags, inputValue.trim()]);
			}
			setInputValue("");
		} else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
			onTagsChange(tags.slice(0, -1));
		}
	};

	const removeTag = (tagToRemove: string) => {
		onTagsChange(tags.filter((tag) => tag !== tagToRemove));
	};

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border border-input rounded-md bg-background">
				{tags.map((tag) => (
					<Badge key={tag} variant="secondary" className="gap-1 pl-2 pr-1">
						{tag}
						<button
							type="button"
							onClick={() => removeTag(tag)}
							className="ml-1 rounded-full hover:bg-secondary-foreground/20 p-0.5"
						>
							<X className="h-3 w-3" />
						</button>
					</Badge>
				))}
				<Input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={tags.length === 0 ? "タグを入力してEnterキーを押す" : ""}
					className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6"
				/>
			</div>
			<p className="text-xs text-muted-foreground">
				例: 微分積分、二次方程式、確率
			</p>
		</div>
	);
}
