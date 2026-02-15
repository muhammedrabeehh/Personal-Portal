'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    CalendarDays,
    CheckSquare,
    LogOut,
    ListTodo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/components/providers/auth-provider'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { motion } from 'framer-motion'

const routes = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Habits', icon: CheckSquare, href: '/habits' },
    { label: 'To-Do', icon: ListTodo, href: '/todo' },
    { label: 'Calendar', icon: CalendarDays, href: '/calendar' },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const { user, signOut } = useAuth()

    return (
        <div
            className={cn(
                'flex h-full flex-col border-r border-border bg-sidebar py-4',
                className
            )}
        >
            <div className="flex-1 px-3 py-2">
                <div className="mb-10 flex items-center justify-between pl-3 pr-1">
                    <Link href="/dashboard">
                        <h1 className="text-2xl font-medium tracking-tight text-foreground">
                            Discipline
                        </h1>
                    </Link>
                    <ThemeToggle />
                </div>
                <div className="space-y-1">
                    {routes.map((route) => {
                        const isActive = pathname === route.href
                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    'group relative flex w-full cursor-pointer items-center rounded-lg p-3 text-sm font-light transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-foreground'
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <route.icon
                                    className={cn(
                                        'mr-3 h-5 w-5 transition-colors',
                                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                    )}
                                />
                                {route.label}
                            </Link>
                        )
                    })}
                </div>
            </div>
            <div className="px-3 py-2">
                <div className="flex items-center gap-x-2 rounded-lg border border-border p-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-muted text-xs text-foreground">
                            {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <p className="truncate text-xs font-medium text-foreground">
                            {user?.email}
                        </p>
                        <Button
                            variant="ghost"
                            className="-ml-3 h-auto justify-start p-1 text-xs text-muted-foreground hover:bg-transparent hover:text-primary"
                            onClick={() => signOut()}
                        >
                            <LogOut className="mr-1.5 h-3 w-3" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
