'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { PageTransition } from '@/components/motion/page-transition'

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative h-full bg-background text-foreground">
            <div className="hidden h-full md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col">
                <Sidebar />
            </div>
            <main className="h-full pb-20 md:pl-72 md:pb-0">
                <div className="h-full p-4 md:p-8">
                    <PageTransition>{children}</PageTransition>
                </div>
            </main>
            <BottomNav />
        </div>
    )
}
