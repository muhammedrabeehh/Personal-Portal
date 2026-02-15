'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AddHabitDialog } from '@/components/habits/add-habit-dialog'
import { HabitRow } from '@/components/habits/habit-card'
import { useAuth } from '@/components/providers/auth-provider'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion/motion-list'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export type Habit = {
    id: string
    name: string
    completed: boolean
}

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const supabase = createClient()

    const fetchHabits = useCallback(async () => {
        if (!user) return

        try {
            const today = new Date().toISOString().split('T')[0]

            const [habitsResult, logsResult] = await Promise.all([
                supabase
                    .from('habits')
                    .select('id, name')
                    .order('created_at', { ascending: true }),
                supabase
                    .from('habit_logs')
                    .select('habit_id')
                    .eq('completed_at', today)
            ])

            if (habitsResult.error) throw habitsResult.error
            if (logsResult.error) throw logsResult.error

            const completedIds = new Set(logsResult.data.map(l => l.habit_id))

            const habitsWithStatus = (habitsResult.data || []).map(h => ({
                id: h.id,
                name: h.name,
                completed: completedIds.has(h.id)
            }))

            setHabits(habitsWithStatus)
        } catch (error) {
            console.error('Error fetching habits:', error)
            toast.error('Failed to load habits')
        } finally {
            setLoading(false)
        }
    }, [user, supabase])

    useEffect(() => {
        if (user) fetchHabits()
    }, [user, fetchHabits])

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
        <div className="max-w-2xl mx-auto space-y-6">
            <FadeIn>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-light tracking-tight text-foreground">Habits</h2>
                    <AddHabitDialog onHabitAdded={fetchHabits} />
                </div>
            </FadeIn>

            {habits.length === 0 ? (
                <FadeIn delay={0.1}>
                    <div className="sheet-list p-8 items-center justify-center text-center">
                        <p className="text-sm font-light text-muted-foreground">No habits yet. Start tracking today!</p>
                    </div>
                </FadeIn>
            ) : (
                <FadeIn delay={0.1}>
                    <div className="sheet-list">
                        <StaggerContainer>
                            {habits.map((habit, index) => (
                                <StaggerItem key={habit.id}>
                                    <HabitRow
                                        habit={habit}
                                        onUpdate={fetchHabits}
                                        onDelete={fetchHabits}
                                    />
                                    {index < habits.length - 1 && <div className="sheet-separator" />}
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </FadeIn>
            )}
        </div>
    )
}
