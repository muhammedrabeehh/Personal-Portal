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
    Legend
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'

export function PerformanceChart() {
    const [data, setData] = useState<{ day: string; habits: number; tasks: number }[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const supabase = createClient()

    useEffect(() => {
        async function fetch() {
            if (!user) return

            const today = new Date()
            const createDate = (offset: number) => {
                const d = new Date()
                d.setDate(today.getDate() - offset)
                return d.toISOString().split('T')[0]
            }

            // Last 7 days including today
            const dates = Array.from({ length: 7 }, (_, i) => createDate(6 - i))
            const startDate = dates[0]
            const endDate = dates[6] // today

            // Fetch Habit Logs
            const { data: habitLogs } = await supabase
                .from('habit_logs')
                .select('completed_at')
                .gte('completed_at', startDate)
                .lte('completed_at', endDate)

            // Fetch Completed Todos
            // Note: completed_at might be null for old tasks, so we filter valid dates
            const { data: todos } = await supabase
                .from('todos')
                .select('completed_at')
                .eq('completed', true)
                .gte('completed_at', startDate + 'T00:00:00') // append time for timestamp comparison
                .lte('completed_at', endDate + 'T23:59:59')

            // Group by Date
            const counts: Record<string, { habits: number; tasks: number }> = {}
            dates.forEach(d => counts[d] = { habits: 0, tasks: 0 })

            habitLogs?.forEach((log) => {
                const dateKey = log.completed_at
                if (counts[dateKey]) {
                    counts[dateKey].habits += 1
                }
            })

            todos?.forEach((todo) => {
                if (todo.completed_at) {
                    const dateKey = todo.completed_at.split('T')[0]
                    if (counts[dateKey]) {
                        counts[dateKey].tasks += 1
                    }
                }
            })

            const chartData = dates.map(date => {
                const d = new Date(date)
                return {
                    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    habits: counts[date].habits,
                    tasks: counts[date].tasks
                }
            })

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
            <h3 className="mb-4 text-sm font-light text-foreground">Weekly Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} barSize={24}>
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 300 }}
                        dy={10}
                    />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip
                        cursor={{ fill: 'var(--muted)/20' }}
                        contentStyle={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--foreground)',
                            fontSize: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        labelStyle={{ color: 'var(--muted-foreground)', fontWeight: 300, marginBottom: '4px' }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)' }}
                    />
                    <Bar
                        name="Habits"
                        dataKey="habits"
                        stackId="a"
                        fill="var(--primary)"
                        radius={[0, 0, 4, 4]} // bottom radius
                    />
                    <Bar
                        name="Tasks"
                        dataKey="tasks"
                        stackId="a"
                        fill="var(--foreground)"
                        opacity={0.3} // Make tasks visually distinct/lighter or darker
                        radius={[4, 4, 0, 0]} // top radius
                    />
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    )
}
