
'use client';

import Footer from "@/components/footer";
import Header from "@/components/header";
import { usePathname } from "next/navigation";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    return (
        <div className="relative flex min-h-dvh flex-col bg-background">
            {!isAuthPage && <Header />}
            <main className="flex-1">{children}</main>
            {!isAuthPage && <Footer />}
        </div>
    )
}
