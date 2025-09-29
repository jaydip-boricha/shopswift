
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative flex min-h-dvh flex-col bg-background">
            <main className="flex-1">{children}</main>
        </div>
    )
}
