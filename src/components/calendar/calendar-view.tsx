'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { AddPlanDialog } from '@/components/calendar/add-plan-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Trash2, Pencil } from 'lucide-react'
import { FadeIn } from '@/components/motion/motion-list'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type Plan = {
    id: string
    title: string
    start_time: string
    end_time: string
    category: string
}

const urgencyConfig: Record<string, { label: string; dotClass: string; pillClass: string }> = {
    light: { label: 'Light Urgent', dotClass: 'bg-[#ca8a04]', pillClass: 'urgency-light' },
    medium: { label: 'Intermediate', dotClass: 'bg-[#ea580c]', pillClass: 'urgency-medium' },
    high: { label: 'Very Urgent', dotClass: 'bg-[#dc2626]', pillClass: 'urgency-high' },
}

// Fallback for old category values
function getUrgency(category: string) {
    return urgencyConfig[category] || urgencyConfig.medium
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function CalendarView() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [plans, setPlans] = useState<Plan[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editUrgency, setEditUrgency] = useState('medium')
    const [editStartTime, setEditStartTime] = useState('')
    const [editEndTime, setEditEndTime] = useState('')
    const [editLoading, setEditLoading] = useState(false)
    const { user } = useAuth()
    const supabase = createClient()

    const fetchPlans = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59)

        const { data, error } = await supabase
            .from('calendar_plans')
            .select('*')
            .gte('start_time', start.toISOString())
            .lte('start_time', end.toISOString())
            .order('start_time', { ascending: true })

        if (error) {
            console.error('Error fetching plans:', error)
            toast.error('Failed to load plans')
        }

        setPlans(data || [])
        setLoading(false)
    }, [user, currentMonth, supabase])

    useEffect(() => {
        if (user) fetchPlans()
    }, [user, fetchPlans])

    async function handleDeletePlan() {
        if (!deleteId) return
        const { error } = await supabase.from('calendar_plans').delete().eq('id', deleteId)
        if (error) toast.error('Failed to delete')
        else { toast.success('Plan deleted'); fetchPlans() }
        setDeleteId(null)
    }

    function startEditing(plan: Plan) {
        setEditingPlan(plan)
        setEditTitle(plan.title)
        setEditUrgency(plan.category)
        const startDate = new Date(plan.start_time)
        const endDate = new Date(plan.end_time)
        setEditStartTime(`${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`)
        setEditEndTime(`${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`)
    }

    async function handleEditPlan() {
        if (!editingPlan || !editTitle.trim()) return
        setEditLoading(true)

        const origStart = new Date(editingPlan.start_time)
        const dateStr = `${origStart.getFullYear()}-${String(origStart.getMonth() + 1).padStart(2, '0')}-${String(origStart.getDate()).padStart(2, '0')}`

        const { error } = await supabase
            .from('calendar_plans')
            .update({
                title: editTitle.trim(),
                category: editUrgency,
                start_time: new Date(`${dateStr}T${editStartTime}:00`).toISOString(),
                end_time: new Date(`${dateStr}T${editEndTime}:00`).toISOString(),
            })
            .eq('id', editingPlan.id)

        if (error) {
            toast.error('Failed to update plan')
        } else {
            toast.success('Plan updated')
            setEditingPlan(null)
            fetchPlans()
        }
        setEditLoading(false)
    }

    const plansByDate = useMemo(() => {
        const map: Record<string, Plan[]> = {}
        plans.forEach((p) => {
            const key = new Date(p.start_time).toDateString()
            if (!map[key]) map[key] = []
            map[key].push(p)
        })
        return map
    }, [plans])

    // Build the grid
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const startDayOffset = ((firstDayOfMonth.getDay() + 6) % 7)
    const totalDays = lastDayOfMonth.getDate()
    const today = new Date()
    const todayStr = today.toDateString()

    const gridCells: (number | null)[] = []
    for (let i = 0; i < startDayOffset; i++) gridCells.push(null)
    for (let d = 1; d <= totalDays; d++) gridCells.push(d)
    while (gridCells.length % 7 !== 0) gridCells.push(null)

    const selectedDateStr = selectedDate?.toDateString() || ''
    const selectedPlans = selectedDate ? (plansByDate[selectedDateStr] || []) : []

    function prevMonth() { setCurrentMonth(new Date(year, month - 1, 1)); setSelectedDate(null) }
    function nextMonth() { setCurrentMonth(new Date(year, month + 1, 1)); setSelectedDate(null) }

    const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-72 w-full rounded-xl" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={prevMonth}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </motion.button>
                    <h3 className="text-lg font-medium text-foreground min-w-[180px] text-center">
                        {monthLabel}
                    </h3>
                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={nextMonth}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </motion.button>
                </div>
                <AddPlanDialog onPlanAdded={fetchPlans} initialDate={selectedDate || undefined} />
            </div>

            {/* Grid */}
            <div className="rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                <div className="mb-1 grid grid-cols-7 gap-1">
                    {WEEKDAYS.map((d) => (
                        <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {gridCells.map((day, idx) => {
                        if (day === null) return <div key={idx} className="aspect-square" />

                        const dateObj = new Date(year, month, day)
                        const dateStr = dateObj.toDateString()
                        const dayPlans = plansByDate[dateStr] || []
                        const isToday = dateStr === todayStr
                        const isSelected = dateStr === selectedDateStr

                        return (
                            <motion.button
                                key={idx}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedDate(isSelected ? null : dateObj)}
                                className={`relative flex aspect-square flex-col items-center justify-start rounded-lg p-1 text-xs transition-colors ${isSelected
                                    ? 'bg-primary/15 text-primary'
                                    : isToday
                                        ? 'bg-primary/8 text-foreground font-medium'
                                        : 'text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                <span className={`${isToday && !isSelected ? 'text-primary font-medium' : ''}`}>
                                    {day}
                                </span>
                                {dayPlans.length > 0 && (
                                    <div className="mt-0.5 flex gap-0.5">
                                        {dayPlans.slice(0, 3).map((p) => (
                                            <div
                                                key={p.id}
                                                className={`h-1.5 w-1.5 rounded-full ${getUrgency(p.category).dotClass}`}
                                            />
                                        ))}
                                        {dayPlans.length > 3 && (
                                            <span className="text-[8px] text-muted-foreground">+{dayPlans.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </motion.button>
                        )
                    })}
                </div>
            </div>

            {/* Plan count summary */}
            <p className="text-xs font-light text-muted-foreground">
                {plans.length} plan{plans.length !== 1 ? 's' : ''} this month
            </p>

            {/* Day detail panel */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="text-sm font-medium text-foreground">
                                    {selectedDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </h4>
                                <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => setSelectedDate(null)}
                                    className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </motion.button>
                            </div>

                            {selectedPlans.length === 0 ? (
                                <p className="text-sm font-light text-muted-foreground">No plans for this day.</p>
                            ) : (
                                <div className="space-y-1">
                                    {selectedPlans.map((plan) => {
                                        const uc = getUrgency(plan.category)
                                        return (
                                            <div
                                                key={plan.id}
                                                className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-muted/30"
                                            >
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <span className={`urgency-pill flex-shrink-0 ${uc.pillClass}`}>
                                                        {uc.label}
                                                    </span>
                                                    <span className="text-sm font-light text-foreground truncate">
                                                        {plan.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(plan.start_time).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                    <motion.button
                                                        whileTap={{ scale: 0.85 }}
                                                        className="p-1.5 text-muted-foreground transition-colors hover:text-primary"
                                                        onClick={() => startEditing(plan)}
                                                        title="Edit plan"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileTap={{ scale: 0.85 }}
                                                        className="p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                                                        onClick={() => setDeleteId(plan.id)}
                                                        title="Delete plan"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete confirmation */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete Plan"
                description="Delete this plan? This action cannot be undone."
                onConfirm={handleDeletePlan}
                confirmLabel="Delete"
                destructive
            />

            {/* Edit plan modal */}
            {editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel mx-4 w-full max-w-md rounded-2xl p-6"
                        style={{ border: '1px solid var(--border)' }}
                    >
                        <h3 className="mb-4 text-lg font-medium text-foreground">Edit Plan</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-light text-muted-foreground">Title</label>
                                <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                                    style={{ borderColor: 'var(--border)' }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-light text-muted-foreground">Start Time</label>
                                    <input
                                        type="time"
                                        value={editStartTime}
                                        onChange={(e) => setEditStartTime(e.target.value)}
                                        className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                                        style={{ borderColor: 'var(--border)' }}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-light text-muted-foreground">End Time</label>
                                    <input
                                        type="time"
                                        value={editEndTime}
                                        onChange={(e) => setEditEndTime(e.target.value)}
                                        className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                                        style={{ borderColor: 'var(--border)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-light text-muted-foreground">Urgency</label>
                                <div className="flex gap-2">
                                    {Object.entries(urgencyConfig).map(([key, cfg]) => (
                                        <button
                                            key={key}
                                            onClick={() => setEditUrgency(key)}
                                            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${editUrgency === key
                                                ? `${cfg.pillClass} ring-2 ring-offset-1`
                                                : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setEditingPlan(null)}
                                className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditPlan}
                                disabled={editLoading}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                {editLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
