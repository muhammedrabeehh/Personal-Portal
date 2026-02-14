'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'

export function DailyReport() {
    const [completed, setCompleted] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const supabase = createClient()

    useEffect(() => {
        async function fetch() {
            if (!user) return
            const { data } = await supabase
                .from('habits')
                .select('current_value, goal_value')

            if (data) {
                setTotal(data.length)
                setCompleted(data.filter((h) => h.current_value >= (h.goal_value || 1)).length)
            }
            setLoading(false)
        }
        fetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    if (loading) return <Skeleton className="h-40 w-full rounded-xl" />

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    const radius = 48
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (pct / 100) * circumference

    return (
        <div className="flex items-center gap-6 rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" className="flex-shrink-0">
                <circle
                    cx="60" cy="60" r={radius}
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="5"
                    opacity="0.4"
                />
                <motion.circle
                    cx="60" cy="60" r={radius}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                    className="progress-ring-circle"
                />
                <text
                    x="60" y="56" textAnchor="middle" dominantBaseline="middle"
                    fill="var(--foreground)" fontSize="22" fontWeight="500"
                >
                    {pct}%
                </text>
                <text
                    x="60" y="74" textAnchor="middle" dominantBaseline="middle"
                    fill="var(--muted-foreground)" fontSize="9" fontWeight="300"
                >
                    COMPLETE
                </text>
            </svg>
            <div className="space-y-1">
                <p className="text-sm font-light text-muted-foreground">Today&apos;s Progress</p>
                <p className="text-2xl font-medium text-foreground">
                    {completed}<span className="text-sm font-light text-muted-foreground"> / {total}</span>
                </p>
                <p className="text-xs font-light text-muted-foreground">habits completed</p>
            </div>
        </div>
    )
}
