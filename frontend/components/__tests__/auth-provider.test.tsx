import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthProvider from "@/components/auth-provider";

vi.mock("next-auth/react", () => ({
	SessionProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="session-provider">{children}</div>
	),
}));

describe("AuthProvider", () => {
	it("renders children wrapped in SessionProvider", () => {
		render(
			<AuthProvider>
				<div>Child Content</div>
			</AuthProvider>,
		);

		expect(screen.getByTestId("session-provider")).toBeInTheDocument();
		expect(screen.getByText("Child Content")).toBeInTheDocument();
	});
});
