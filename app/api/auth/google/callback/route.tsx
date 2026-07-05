import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { createOAuth2Client, GoogleProvider } from "@/lib/google";
import { getUserByClerkId, upsertIntegration } from "@/lib/db/queries";
import { encrypt } from "@/lib/encryption";

export async function GET(request: NextRequest) {
    //get the cookies
    const cookieStore = await cookies();

    try {
        //verify auth
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }

        //parse the code from the query params
        const code = request.nextUrl.searchParams.get("code");
        const state = request.nextUrl.searchParams.get("state");
        const error = request.nextUrl.searchParams.get("error");

        if (error) {
            return NextResponse.redirect(
                new URL("settings?error=consent_denied", request.url),
            );
        }

        if (!code || !state) {
            return NextResponse.redirect(
                new URL("settings?error=missing_params", request.url),
            );
        }

        //validate the cdrf state
        const storedState = cookieStore.get("google_oauth_state")?.value;

        if (!storedState || storedState !== storedState) {
            return NextResponse.redirect(
                new URL("settings?error=invalid_state", request.url),
            );
        }

        //parse the provider from the state
        const { provider } = JSON.parse(
            Buffer.from(state, "base64url").toString(),
        ) as { nonce: string; provider: GoogleProvider };

        //exchange the code for token
        const oauth2Client = createOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.access_token || !tokens.refresh_token) {
            return NextResponse.redirect(
                new URL("settings?error=no_tokens", request.url),
            );
        }

        //lookup for internal user
        const user = await getUserByClerkId(clerkId);
        if (!user) {
            return NextResponse.redirect(
                new URL("/settings?error=user_not_found", request.url),
            );
        }

        //encrypt the token and store the token in the database
        await upsertIntegration({
            userId: user.id,
            provider,
            accessToken: encrypt(tokens.access_token),
            refreshToken: encrypt(tokens.refresh_token),
            expiresAt: new Date(tokens.expiry_date ?? Date.now() + 3600 * 1000),
            scope: tokens.scope?.split(" ") ?? [],
        });

        //clear state cookie
        cookieStore.delete("google_oauth_state");

        //redirect to the settings page
        return NextResponse.redirect(
            new URL(`/settings?connected=${provider}`, request.url),
        );
    } catch (error) {
        console.error("Google OAuth callback error:", error);
        cookieStore.delete("google_oauth_state");
        return NextResponse.redirect(
            new URL("/settings?error=callback_failed", request.url),
        );
    }

}
