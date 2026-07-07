import { runAgent } from "@/lib/agent";
import { getUserByClerkId, getUsersWithAgentEnabled } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { Summary } from "lucide-react";
import { NextResponse } from "next/server";

export async function POST() {
    const isCron = process.env.CRON_SECRET;

    //2jobs
    //1. Manual run job
    //2. Auto run job

    if (!isCron) {
        //auth
        const { userId: ClerkId } = await auth();
        if (!ClerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        //get the clerk user by id
        const user = await getUserByClerkId(ClerkId);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        if (!user.agentEnabled) {
            return NextResponse.json(
                { error: "Agent is not enabled" },
                { status: 403 },
            );
        }

        //run agent
        const result = await runAgent(user.id);

        return NextResponse.json(result);
    }

    //cron job
    //get the clerk user by id
    const results = [];
    const eligibleUsers = await getUsersWithAgentEnabled();
    for (const user of eligibleUsers) {
        const result = await runAgent(user.id);
        result.push({
            userId: user.id,
            status: result.status,
            summary: result.summary,
        });
    }

    // run agent
    return NextResponse.json({ results, processedCount: results.length });
}
