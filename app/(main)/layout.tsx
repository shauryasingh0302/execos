import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrCreateUser } from "@/lib/db/queries";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { HomeIcon, MailIcon, SettingsIcon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    //checking if user authenticated

    const { userId, has } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const clerkUser = await currentUser();

    const email = clerkUser?.emailAddresses[0]?.emailAddress;

    //get the user from the db or create the user

    const user = await getOrCreateUser(userId, email!);

    const isPaidUser = has({ plan: "premium" });

    const navItems = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: HomeIcon,
        },
        {
            label: "Monitoring",
            href: "/monitoring",
            icon: MailIcon,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: SettingsIcon,
        },
    ];

    return (
        <div className="layout-wrapper">
            <aside className="sidebar-container">
                <div className="sidebar-inner">
                    <div className="logo-container">
                        <Link href="/">
                            <span className="logo-text ml-4">ExecOS</span>
                        </Link>
                    </div>
                    <nav className="sidebar-nav">
                        {navItems.map((item) => (
                            <Link href={item.href} key={item.href}>
                                <Button
                                    variant="ghost"
                                    className="sidebar-nav-button"
                                >
                                    <item.icon className="sidebar-icon" />
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </nav>
                    {!isPaidUser && (
                        <div className="sidebar-section">
                            <div className="upgrade-card">
                                <div className="upgrade-card-header">
                                    <ZapIcon className="sidebar-icon" />
                                    <span className="font-semibold">
                                        Upgrade to Pro
                                    </span>
                                </div>
                                <p className="upgrade-card-text">
                                    Unlock autonomous AI agents
                                </p>
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href="/#pricing">Upgrade Now</Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="sidebar-section">
                        <div className="user-profile">
                            <div className="flex items-center gap-3">
                                <UserButton />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">
                                        Hi, {clerkUser?.firstName}{" "}
                                        {clerkUser?.lastName}
                                    </span>
                                </div>
                            </div>

                            {isPaidUser && <Badge>Pro</Badge>}
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <div className="main-content-inner">{children}</div>
            </main>
        </div>
    );
}
