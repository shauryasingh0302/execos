"use client";
import { useTransition } from "react";
import { Button } from "../ui/button";
import { Loader2Icon } from "lucide-react";

export function RunAgentButton() {
    const [isPending, startTransition] = useTransition();
    const handleRunAgent = async () => {
        startTransition(async () => {});
    };
    return (
        <Button
            className="w-full"
            variant={"outline"}
            onClick={handleRunAgent}
            disabled={isPending}
        >
            {isPending ? (
                <>
                    <Loader2Icon className="spinner-icon" />
                    Running Agent...
                </>
            ) : (
                "Run Agent Now"
            )}
        </Button>
    );
}
