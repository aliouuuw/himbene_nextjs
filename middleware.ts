import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
// import { cookies } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";

interface PayloadType {
	id: string,
	email: string,
	role: string,
	iat: number,
	iss: string,
	aud: string,
	exp: number,
	sub: string
  }

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const { pathname } = request.nextUrl;

	// Handle sign-in route first
	if (pathname.startsWith("/sign-in")) {
		if (sessionCookie) {
			return NextResponse.redirect(new URL("/dashboard/", request.url));
		}
		return NextResponse.next();
	}
	
	// Then check for session cookie for other routes
	if (!sessionCookie) {
		// Redirect to sign-in if no token found
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
	
	try {
		// Validate the token
		const response = await fetch(`${request.nextUrl.origin}/api/auth/token`, {
			headers: {
				"Authorization": `Bearer ${sessionCookie}`
			},
		});
		
		if (!response.ok) {
			throw new Error("Invalid token");
		}
		
		// Parse the JWT payload
		const tokenData = await response.json();
		const decodedToken = jwtDecode(tokenData.token) as PayloadType;
		//console.log("decodedToken", decodedToken);

		// Access user data from the token
		const userRole = decodedToken.role || "";

		// Handle root dashboard access
		if (pathname === "/dashboard") {
			// const cookieStore = await cookies();
			if (userRole === "ADMIN") {
				return NextResponse.redirect(new URL("/dashboard/admin", request.url));
			} else if (userRole === "INFOGRAPHE") {
				return NextResponse.redirect(new URL("/dashboard/infographe/home", request.url));
			} else if (userRole === "COMMERCIAL") {
				return NextResponse.redirect(new URL("/dashboard/commercial/home", request.url));
			}
			// cookieStore.delete("auth_token");
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}

		// Check infographe routes access
		if (pathname.startsWith("/dashboard/infographe")) {
			if (userRole !== "INFOGRAPHE" && userRole !== "ADMIN") {
				return NextResponse.redirect(new URL("/unauthorized", request.url));
			}
		}

		// Check commercial routes access
		if (pathname.startsWith("/dashboard/commercial")) {
			if (userRole !== "COMMERCIAL" && userRole !== "ADMIN") {
				return NextResponse.redirect(new URL("/unauthorized", request.url));
			}
		}

		// Check admin routes access
		if (pathname.startsWith("/dashboard/admin")) {
			if (userRole !== "ADMIN") {
				return NextResponse.redirect(new URL("/unauthorized", request.url));
			}
		}

		return NextResponse.next();
	} catch (error) {
		console.error("Token validation error:", error);
		// Redirect to sign-in on token validation failure
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
}

// Define which paths the middleware should run on
export const config = {
	matcher: ["/dashboard", "/dashboard/:path*", "/sign-in"],
};
