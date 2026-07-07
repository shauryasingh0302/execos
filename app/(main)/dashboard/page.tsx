import { RunAgentButton } from "@/components/agents/RunAgentButton";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    getLatestAgentRun,
    getOrCreateUser,
    getUnreadEmails,
    getUserIntegrations,
} from "@/lib/db/queries";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Badge, CheckCircle2Icon, CircleIcon, ZapIcon, Bot, BotIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
        redirect("/sign-in");
    }
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0].emailAddress ?? "";
    const name = clerkUser?.fullName ?? "";
    const user = await getOrCreateUser(clerkId, email, name);

    const latestRun = await getLatestAgentRun(user.id);

    const userIntegrations = await getUserIntegrations(user.id);
    const gmailConnected = userIntegrations.some(
        (integration) => integration.provider === "gmail",
    );
    const googleCalendarConnected = userIntegrations.some(
        (integration) => integration.provider === "google_calendar",
    );

    const { has } = await auth();
    const isPaidUser = has({ plan: "premium" });

    const onboardingSteps = [
        {
            name: "Connect Gmail",
            completed: gmailConnected,
            href: "/settings",
        },
        {
            name: "Connect Google Calendar",
            completed: googleCalendarConnected,
            href: "/settings",
        },
        {
            name: "Subscribe to activate agent",
            completed: isPaidUser,
            href: "/settings",
        },
    ];

    const completedCount = onboardingSteps.filter(
        (step) => step.completed,
    ).length;
    const progressPercent = Math.round(
        (completedCount / onboardingSteps.length) * 100,
    );

    const { emailsProcessed, draftsCreated, tasksCreated } =
        await getUnreadEmails(user.id);

    return (
        <div className="page-wrapper">
            <div>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-description">
                    Welcome back! Here's what's happening with your AI Agents.
                </p>
                {/* <RunAgentButton /> */}
            </div>

            {/* 1. First Progress Card  */}
            <div className="space-y-4">
                {!user.onboardingCompleted && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Get Started</CardTitle>
                            <CardDescription>
                                Complete these steps to activate your AI
                                assistant
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="card-content-stack">
                            <div className="card-content-stack-sm">
                                {onboardingSteps.map((step, index) => (
                                    <Link
                                        key={step.name}
                                        href={step.href}
                                        className={
                                            step.completed
                                                ? "pointer-events-none"
                                                : ""
                                        }
                                    >
                                        <div className="flex items-center gap-2 mt-2">
                                            {step.completed ? (
                                                <CheckCircle2Icon className="sidebar-icon text-primary" />
                                            ) : (
                                                <CircleIcon className="sidebar-icon text-muted-foreground" />
                                            )}
                                            <span
                                                className={
                                                    step.completed
                                                        ? "onboarding-step-completed text-muted-foreground line-through"
                                                        : ""
                                                }
                                            >
                                                {index + 1}. {step.name}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Progress
                                value={progressPercent}
                                className="onboarding-progress"
                            />
                            <p className="status-label">
                                {completedCount} of {onboardingSteps.length}{" "}
                                steps complete
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* 2. Agent status card*/}

                <div className="stats-grid-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="card-title-with-icon">
                                <ZapIcon className="sidebar-icon" />
                                Agent Status
                            </CardTitle>
                            <CardDescription>
                                Subscribe to activate the autonomous agent
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="card-content-stack">
                                <div className="status-row">
                                    <span className="status-label">Status</span>
                                    <Badge className="bg-primary">Ready</Badge>
                                </div>
                                <div className="status-row">
                                    <span className="status-label">Gmail</span>
                                    <span className="status-value">
                                        Connected
                                    </span>
                                </div>
                                <RunAgentButton />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Last agent run card */}

                    <Card>
                        <CardHeader>
                            <CardTitle className="card-title-with-icon"> <BotIcon className="sidebar-icon" />Last Agent Run</CardTitle>
                            <CardDescription>
                                {latestRun
                                    ? "Most Recent Activity"
                                    : "No runs yet"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="card-content-stack-sm">
                                {[
                                    {
                                        label: "Time",
                                        value: latestRun?.startedAt
                                            ? new Date(
                                                  latestRun.startedAt,
                                              ).toLocaleString()
                                            : "N/A",
                                    },
                                    {
                                        label: "Status",
                                        value: latestRun?.status || "N/A",
                                    },
                                    {
                                        label: "Summary",
                                        value: latestRun?.summary || "N/A",
                                    },
                                ]?.map((item) => (
                                    <div
                                        key={item.label}
                                        className="status-row gap-4 flex"
                                    >
                                        <span className="status-label">
                                            {item.label}
                                        </span>
                                        <span className="status-value">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 4. Quick stats */}

                <div className="stats-grid-3">
                    {[
                        { label: "Unread Emails", value: emailsProcessed },
                        { label: "Drafts Created", value: draftsCreated },
                        { label: "Tasks Created", value: tasksCreated },
                    ].map((item) => (
                        <Card key={item.label}>
                            <CardHeader className="stat-card-header">
                                <CardTitle className="stat-card-title">
                                    {item.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="stat-value">{item.value}</div>
                                {/* <p className="stat-card-subtitle">
                                    {item.value === 0 ? "No items" : "View All"}
                                </p> */}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
