import { Button } from "@/components/ui/button";
import { PricingTable, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const Page = async () => {
    const { userId } = await auth();

    return (
        <div className="landing-wrapper">
            <header className="landing-header">
                <div className="landing-header-inner">
                    <div className="logo-container">
                        <Link href="/">
                            <span className="logo-text">ExecOS</span>
                        </Link>

                        {userId ? (
                            <div className="nav-actions">
                                <Link href="/dashboard">
                                    <Button variant="ghost">Dashboard</Button>
                                </Link>
                                <UserButton />
                            </div>
                        ) : (
                            <div className="nav-actions">
                                <SignInButton />
                                <SignUpButton />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <section className="hero-section">
                <h2>Simple, Transparent Pricing</h2>
                <PricingTable/>
            </section>
        </div>
    );
};

export default Page;
