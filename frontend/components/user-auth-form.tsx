"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function UserAuthForm() {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return <div>Loading...</div>;
	}

	if (session) {
		return (
			<div className="flex items-center space-x-2">
				<span className="text-sm">こんにちは、{session.user?.name}さん</span>
				<Button onClick={() => signOut()}>サインアウト</Button>
			</div>
		);
	}

	return <Button onClick={() => signIn("google")}>Googleでサインイン</Button>;
}
