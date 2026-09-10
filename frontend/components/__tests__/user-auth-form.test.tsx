import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn, signOut, useSession } from "next-auth/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserAuthForm from "@/components/user-auth-form";

vi.mock("next-auth/react", () => ({
	useSession: vi.fn(),
	signIn: vi.fn(),
	signOut: vi.fn(),
}));

describe("UserAuthForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders loading state when session is loading", () => {
		vi.mocked(useSession).mockReturnValue({
			data: null,
			status: "loading",
			update: vi.fn(),
		});

		render(<UserAuthForm />);
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("renders sign in button when user is unauthenticated", async () => {
		const user = userEvent.setup();
		vi.mocked(useSession).mockReturnValue({
			data: null,
			status: "unauthenticated",
			update: vi.fn(),
		});

		render(<UserAuthForm />);
		const signInButton = screen.getByRole("button", {
			name: "Googleでサインイン",
		});
		expect(signInButton).toBeInTheDocument();

		await user.click(signInButton);
		expect(signIn).toHaveBeenCalledWith("google");
	});

	it("renders user name and sign out button when authenticated", async () => {
		const user = userEvent.setup();
		vi.mocked(useSession).mockReturnValue({
			data: {
				user: { name: "山田太郎", email: "taro@example.com" },
				expires: "2099-01-01",
			},
			status: "authenticated",
			update: vi.fn(),
		});

		render(<UserAuthForm />);
		expect(screen.getByText("こんにちは、山田太郎さん")).toBeInTheDocument();

		const signOutButton = screen.getByRole("button", { name: "サインアウト" });
		expect(signOutButton).toBeInTheDocument();

		await user.click(signOutButton);
		expect(signOut).toHaveBeenCalled();
	});
});
