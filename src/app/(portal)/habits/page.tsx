'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AddHabitDialog } from '@/components/habits/add-habit-dialog'
import { HabitRow } from '@/components/habits/habit-card'
import { useAuth } from '@/components/providers/auth-provider'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion/motion-list'
import { Skeleton } from '@/components/ui/skeleton'

type Habit = {
    id: string
    name: string
    current_value: number
}

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const supabase = createClient()

    const fetchHabits = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('habits')
            .select('id, name, current_value')
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching habits:', error)
            setLoading(false)
            return
        }

        setHabits(data || [])
        setLoading(false)
    }, [user, supabase])

    useEffect(() => {
        if (user) fetchHabits()
    }, [user, fetchHabits])

    // Midnight reset: check every 60s if day has changed
    useEffect(() => {
        let lastDate = new Date().toDateString()

        const interval = setInterval(() => {
            const currentDate = new Date().toDateString()
            if (currentDate !== lastDate) {
                lastDate = currentDate
                fetchHabits() // Refetch — server should have reset values
            }
        }, 60_000)

        return () => clearInterval(interval)
    }, [fetchHabits])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-11 w-28" />
                </div>
                <div className="space-y-0">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full mb-1" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-medium tracking-tight text-foreground">Habits</h2>
                    <AddHabitDialog onHabitAdded={fetchHabits} />
                </div>
            </FadeIn>

            {habits.length === 0 ? (
                <FadeIn delay={0.1}>
                    <div className="flex h-40 items-center justify-center rounded-lg text-sm font-light text-muted-foreground"
                        style={{ border: '1px dashed var(--border)' }}
                    >
                        No habits yet. Start tracking today!
                    </div>
                </FadeIn>
            ) : (
                <FadeIn delay={0.1}>
                    <div className="rounded-xl px-4" style={{ border: '1px solid var(--border)' }}>
                        <StaggerContainer>
                            {habits.map((habit) => (
                                <StaggerItem key={habit.id}>
                                    <HabitRow
                                        habit={habit}
                                        onUpdate={fetchHabits}
                                        onDelete={fetchHabits}
                                    />
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </FadeIn>
            )}
        </div>
    )
}
