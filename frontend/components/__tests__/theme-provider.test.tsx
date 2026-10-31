import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";

vi.mock("next-themes", () => ({
	ThemeProvider: ({
		children,
		attribute,
	}: {
		children: React.ReactNode;
		attribute?: string;
	}) => (
		<div data-testid="next-themes-provider" data-attribute={attribute}>
			{children}
		</div>
	),
}));

describe("ThemeProvider", () => {
	it("renders children and passes props to NextThemesProvider", () => {
		render(
			<ThemeProvider attribute="class">
				<div>Themed Content</div>
			</ThemeProvider>,
		);

		const provider = screen.getByTestId("next-themes-provider");
		expect(provider).toBeInTheDocument();
		expect(provider).toHaveAttribute("data-attribute", "class");
		expect(screen.getByText("Themed Content")).toBeInTheDocument();
	});
});
