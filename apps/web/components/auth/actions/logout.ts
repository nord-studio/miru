"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const logOut = async () => {
	"use server";
	await auth.api.signOut({ headers: await headers() });
	return redirect("/auth/login");
}

export default logOut;