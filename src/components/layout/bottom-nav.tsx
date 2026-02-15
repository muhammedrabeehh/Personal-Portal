'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, CheckSquare, ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const routes = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'To-Do', icon: ListTodo, href: '/todo' },
    { label: 'Habits', icon: CheckSquare, href: '/habits' },
    { label: 'Calendar', icon: CalendarDays, href: '/calendar' },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-sidebar/95 backdrop-blur-md px-2 pb-safe md:hidden">
            {routes.map((route) => {
                const isActive = pathname === route.href
                return (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            'relative flex min-h-[44px] flex-col items-center justify-center space-y-0.5 px-3 py-1',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="bottom-nav-active"
                                className="absolute -top-px left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-primary"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <route.icon className={cn('h-5 w-5', isActive && 'fill-current')} />
                        <span className="text-[10px] font-light">{route.label}</span>
                    </Link>
                )
            })}
        </div>
    )
}
