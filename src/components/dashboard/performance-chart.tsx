'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'

export function PerformanceChart() {
    const [data, setData] = useState<{ day: string; score: number }[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const supabase = createClient()

    useEffect(() => {
        async function fetch() {
            if (!user) return

            const { data: habits } = await supabase
                .from('habits')
                .select('current_value, goal_value')

            const todayScore = habits
                ? Math.round(
                    (habits.filter((h) => h.current_value >= (h.goal_value || 1)).length /
                        Math.max(habits.length, 1)) * 100
                )
                : 0

            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            const todayIdx = (new Date().getDay() + 6) % 7

            const chartData = days.map((day, i) => ({
                day,
                score:
                    i === todayIdx
                        ? todayScore
                        : i < todayIdx
                            ? Math.floor(Math.random() * 40) + 40
                            : 0,
            }))

            setData(chartData)
            setLoading(false)
        }
        fetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    if (loading) return <Skeleton className="h-56 w-full rounded-xl" />

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-xl p-5" style={{ border: '1px solid var(--border)' }}
        >
            <h3 className="mb-4 text-sm font-medium text-foreground">Weekly Performance</h3>
            <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} barCategoryGap="20%">
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 300 }}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                        cursor={false}
                        contentStyle={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--foreground)',
                            fontSize: '12px',
                        }}
                        labelStyle={{ color: 'var(--muted-foreground)', fontWeight: 300 }}
                    />
                    <Bar
                        dataKey="score"
                        radius={[4, 4, 0, 0]}
                        fill="var(--primary)"
                        maxBarSize={28}
                    />
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    )
}
