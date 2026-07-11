"use client";

import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

function ErrorFallback({
	error,
	resetError,
}: {
	error: Error;
	resetError: () => void;
}) {
	const [showDetails, setShowDetails] = useState(false);

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5" />
						<CardTitle className="text-lg">
							予期しないエラーが発生しました
						</CardTitle>
					</div>
					<CardDescription>
						アプリケーションで問題が発生しました。再読み込みをお試しください。
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="outline"
						size="sm"
						className="w-full gap-2"
						onClick={() => setShowDetails(!showDetails)}
					>
						{showDetails ? (
							<>
								<ChevronUp className="h-4 w-4" />
								詳細を隠す
							</>
						) : (
							<>
								<ChevronDown className="h-4 w-4" />
								詳細を表示
							</>
						)}
					</Button>
					{showDetails && error && (
						<pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-40">
							{error.message}
							{error.stack}
						</pre>
					)}
				</CardContent>
				<CardFooter>
					<Button className="w-full gap-2" onClick={resetError}>
						<RefreshCw className="h-4 w-4" />
						再読み込み
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
		this.setState({ errorInfo });
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null, errorInfo: null });
	};

	render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}
			return (
				<ErrorFallback error={this.state.error} resetError={this.handleReset} />
			);
		}

		return this.props.children;
	}
}
