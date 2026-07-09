"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProcessedEmail } from "@/lib/db/schema";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  ListTodo,
  User,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
};

const categoryStyles: Record<string, string> = {
  work: "bg-muted text-muted-foreground border-transparent",
  personal: "bg-muted text-muted-foreground border-transparent",
  newsletter: "bg-muted text-muted-foreground border-transparent",
  notification: "bg-muted text-muted-foreground border-transparent",
  spam: "bg-destructive/10 text-destructive border-destructive/20",
  other: "bg-muted text-muted-foreground border-transparent",
};

export function EmailDetail({ email }: { email: ProcessedEmail }) {
  const [expanded, setExpanded] = useState(false);

  const senderName =
    email.from?.split("<")[0]?.trim().replace(/"/g, "") || email.from;

  const hasDetails =
    (email.actionItems && email.actionItems.length > 0) || email.draftReply;

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 shadow-sm transition-all duration-200",
        "hover:border-border hover:shadow-md",
        expanded && "border-border shadow-md"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-t-xl"
      >
        <CardContent className="flex items-start gap-4 p-5">
          <div className="min-w-0 flex-1 space-y-2">
            {/* Subject + badges */}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[15px] font-semibold leading-snug text-foreground">
                {email.subject || "(No subject)"}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5">
                {email.priority && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 rounded-full px-2 text-[11px] font-medium capitalize",
                      priorityStyles[email.priority] ?? "bg-muted"
                    )}
                  >
                    {email.priority}
                  </Badge>
                )}
                {email.category && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 rounded-full px-2 text-[11px] font-medium capitalize",
                      categoryStyles[email.category] ?? ""
                    )}
                  >
                    {email.category}
                  </Badge>
                )}
                {email.draftCreated && (
                  <Badge
                    variant="outline"
                    className="h-5 gap-1 rounded-full border-transparent bg-muted px-2 text-[11px] font-medium text-muted-foreground"
                  >
                    <FileText className="h-3 w-3" />
                    Draft
                  </Badge>
                )}
                {(email.tasksCreated ?? 0) > 0 && (
                  <Badge
                    variant="outline"
                    className="h-5 gap-1 rounded-full border-transparent bg-muted px-2 text-[11px] font-medium text-muted-foreground"
                  >
                    <ListTodo className="h-3 w-3" />
                    {email.tasksCreated} task
                    {email.tasksCreated !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>

            {/* From + date */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{senderName}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {new Date(email.processedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Summary */}
            {email.summary && (
              <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground/90">
                {email.summary}
              </p>
            )}
          </div>

          <div className="mt-1 shrink-0 rounded-full p-1 text-muted-foreground/60 transition-colors">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </CardContent>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 border-t border-border/60 duration-200">
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            {/* Action Items */}
            {email.actionItems && email.actionItems.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <ListTodo className="h-3.5 w-3.5" />
                  Action items
                </h4>
                <ul className="space-y-2">
                  {email.actionItems.map((item, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-border/60 bg-muted/40 p-3"
                    >
                      <p className="text-[13px] font-medium leading-snug text-foreground">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      {item.dueDate && (
                        <p className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-amber-600 dark:text-amber-400">
                          <Clock className="h-3 w-3" />
                          Due {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Draft Reply */}
            {email.draftReply && (
              <div className="space-y-2.5">
                <h4 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Draft reply
                </h4>
                <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
                    {email.draftReply}
                  </p>
                </div>
              </div>
            )}

            {/* No details */}
            {!hasDetails && (
              <div className="sm:col-span-2">
                <p className="text-[13px] text-muted-foreground">
                  No action items or draft reply for this email.
                </p>
              </div>
            )}
          </div>

          {/* Error state */}
          {email.status === "Error" && email.error && (
            <div className="border-t border-destructive/20 bg-destructive/5 px-5 py-3">
              <p className="text-[13px] font-medium text-destructive">
                Error: {email.error}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}