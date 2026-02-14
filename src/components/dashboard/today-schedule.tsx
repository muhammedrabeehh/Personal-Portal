'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { StaggerContainer, StaggerItem } from '@/components/motion/motion-list'

type Plan = {
    id: string
    title: string
    start_time: string
    category: string
}

const urgencyConfig: Record<string, { label: string; pillClass: string }> = {
    light: { label: 'Light', pillClass: 'urgency-light' },
    medium: { label: 'Medium', pillClass: 'urgency-medium' },
    high: { label: 'Urgent', pillClass: 'urgency-high' },
}

export function TodaySchedule() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const supabase = createClient()

    useEffect(() => {
        async function fetch() {
            if (!user) return
            const now = new Date()
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

            const { data } = await supabase
                .from('calendar_plans')
                .select('id, title, start_time, category')
                .gte('start_time', startOfDay)
                .lte('start_time', endOfDay)
                .order('start_time', { ascending: true })

            setPlans(data || [])
            setLoading(false)
        }
        fetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    if (loading) return <Skeleton className="h-32 w-full rounded-xl" />

    return (
        <div className="rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
            <h3 className="mb-3 text-sm font-medium text-foreground">Today&apos;s Schedule</h3>
            {plans.length === 0 ? (
                <p className="text-sm font-light text-muted-foreground">Nothing scheduled today.</p>
            ) : (
                <StaggerContainer className="space-y-0">
                    {plans.map((plan) => {
                        const uc = urgencyConfig[plan.category] || urgencyConfig.medium
                        return (
                            <StaggerItem key={plan.id}>
                                <div
                                    className="flex items-center justify-between py-2.5"
                                    style={{ borderBottom: '1px solid var(--separator)' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`urgency-pill ${uc.pillClass}`}>{uc.label}</span>
                                        <span className="text-sm font-light text-foreground">{plan.title}</span>
                                    </div>
                                    <span className="text-xs font-light text-muted-foreground">
                                        {new Date(plan.start_time).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </StaggerItem>
                        )
                    })}
                </StaggerContainer>
            )}
        </div>
    )
}
