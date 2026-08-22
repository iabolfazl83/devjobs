import {NextRequest, NextResponse} from "next/server";

export function middleware(request: NextRequest) {
    const isLoggedIn = request.cookies.has('session');
    const {pathname} = request.nextUrl;

    if (!isLoggedIn && pathname === '/saved') {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isLoggedIn && pathname === '/login') {
        return NextResponse.redirect(new URL('/jobs', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/saved", "/login"],
};