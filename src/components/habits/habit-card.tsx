'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type Habit = {
    id: string
    name: string
    current_value: number
}

export function HabitRow({
    habit,
    onUpdate,
    onDelete,
}: {
    habit: Habit
    onUpdate: () => void
    onDelete: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState(habit.name)
    const [editLoading, setEditLoading] = useState(false)
    const supabase = createClient()

    const isCompleted = habit.current_value >= 1

    async function toggleHabit() {
        if (isEditing) return
        setLoading(true)
        const newValue = isCompleted ? 0 : 1
        const { error } = await supabase
            .from('habits')
            .update({ current_value: newValue })
            .eq('id', habit.id)

        if (error) {
            toast.error('Failed to update habit')
        } else {
            onUpdate()
        }
        setLoading(false)
    }

    async function deleteHabit() {
        const { error } = await supabase.from('habits').delete().eq('id', habit.id)
        if (error) {
            toast.error('Failed to delete habit')
        } else {
            toast.success('Habit deleted')
            onDelete()
        }
    }

    async function saveEdit() {
        if (!editName.trim()) {
            toast.error('Name cannot be empty')
            return
        }
        setEditLoading(true)
        const { error } = await supabase
            .from('habits')
            .update({ name: editName.trim() })
            .eq('id', habit.id)

        if (error) {
            toast.error('Failed to rename habit')
        } else {
            toast.success('Habit renamed')
            setIsEditing(false)
            onUpdate()
        }
        setEditLoading(false)
    }

    function cancelEdit() {
        setEditName(habit.name)
        setIsEditing(false)
    }

    return (
        <>
            <motion.div
                layout
                className="flex items-center justify-between py-3.5"
                style={{ borderBottom: '1px solid var(--separator)' }}
            >
                {/* Left: toggle + name */}
                <div className="flex min-h-[44px] flex-1 items-center gap-3 min-w-0">
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        className={`habit-toggle ${isCompleted ? 'checked' : ''}`}
                        onClick={toggleHabit}
                        disabled={loading || isEditing}
                        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    />

                    {isEditing ? (
                        <div className="flex flex-1 items-center gap-1.5">
                            <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit()
                                    if (e.key === 'Escape') cancelEdit()
                                }}
                                className="flex-1 rounded border bg-transparent px-2 py-1 text-sm text-foreground outline-none focus:border-primary"
                                style={{ borderColor: 'var(--border)' }}
                                autoFocus
                                disabled={editLoading}
                            />
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={saveEdit}
                                disabled={editLoading}
                                className="p-1 text-primary transition-colors hover:text-primary/80"
                                title="Save"
                            >
                                <Check className="h-3.5 w-3.5" />
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={cancelEdit}
                                className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                                title="Cancel"
                            >
                                <X className="h-3.5 w-3.5" />
                            </motion.button>
                        </div>
                    ) : (
                        <button
                            onClick={toggleHabit}
                            disabled={loading}
                            className="flex-1 text-left"
                        >
                            <span
                                className={`text-sm transition-all ${isCompleted
                                        ? 'font-light text-primary line-through opacity-50'
                                        : 'font-light text-foreground'
                                    }`}
                            >
                                {habit.name}
                            </span>
                        </button>
                    )}
                </div>

                {/* Right: edit + delete buttons */}
                {!isEditing && (
                    <div className="ml-2 flex flex-shrink-0 items-center gap-0.5">
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            className="p-1.5 text-muted-foreground transition-colors hover:text-primary"
                            onClick={() => setIsEditing(true)}
                            title="Edit habit"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            className="p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                            onClick={() => setConfirmOpen(true)}
                            title="Delete habit"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                    </div>
                )}
            </motion.div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Habit"
                description={`Are you sure you want to delete "${habit.name}"?`}
                onConfirm={deleteHabit}
                confirmLabel="Delete"
                destructive
            />
        </>
    )
}
