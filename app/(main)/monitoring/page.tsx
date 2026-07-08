import { EmailDetail } from "@/components/agents/email-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAgentRuns, getOrCreateUser } from "@/lib/db/queries";
import { currentUser, auth } from "@clerk/nextjs/server";
import {
    AlertCircleIcon,
    FileTextIcon,
    ListTodoIcon,
    MailIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

const Monitoring = async () => {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
        redirect("/sign-in");
    }
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0].emailAddress ?? "";
    const name = clerkUser?.fullName ?? "";
    const user = await getOrCreateUser(clerkId, email, name);

    const runs = await getAgentRuns(user.id);

    const processedEmails = [];

    for (const run of runs) {
        const log = run.actionsLog ?? [];
        for (const entry of log) {
            if (entry.emailId) {
                processedEmails.push({
                    ...entry,
                    processedAt: run.startedAt,
                });
            }
        }
    }

    const highPriority = processedEmails.filter(
        (email) => email.priority === "high",
    ).length;

    const totalTask = processedEmails.reduce(
        (acc, email) => acc + (email.tasksCreated ?? 0),
        0,
    );

    const totalDrafts = processedEmails.filter(
        (email) => email.draftCreated,
    ).length;

    const totalProcessed = processedEmails.length;

    return (
        <div className="page-wrapper">
            <div>
                <h1 className="page-title">Monitoring</h1>
                <p className="page-description">
                    Emails processed by your AI agent
                </p>
            </div>

            <div className="stats-grid-4">
                {[
                    {
                        label: "Processed",
                        value: totalProcessed,
                        icon: MailIcon,
                    },
                    {
                        label: "High Priority",
                        value: highPriority,
                        icon: AlertCircleIcon,
                    },
                    {
                        label: "Drafts Created",
                        value: totalDrafts,
                        icon: FileTextIcon,
                    },
                    {
                        label: "Tasks Extracted",
                        value: totalTask,
                        icon: ListTodoIcon,
                    },
                ].map(({ label, value, icon: Icon }) => (
                    <Card key={label}>
                      <CardHeader className="stat-card-header">
                        <CardTitle className="text-sm font-medium">{label}</CardTitle>
                        <Icon className="stat-icon"/>
                      </CardHeader>
                      <CardContent>
                        <div className="stat-value">{value}</div>
                      </CardContent>
                    </Card>
                ))}
            </div>
            <div className="space-y-3">
              {processedEmails.map((email, idx)=>(
                <EmailDetail key={`${email.emailId}-${idx}`} email={email}/>
              ))}
            </div>
        </div>
    );
};

export default Monitoring;
