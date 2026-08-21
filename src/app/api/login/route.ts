import {NextResponse} from "next/server";

export async function POST() {
    const response = NextResponse.json({message: "Logged in"}, {status: 200});
    response.cookies.set("session", "fake-session-value", {
        httpOnly: true,
        path: "/",
    });
    return response;
}