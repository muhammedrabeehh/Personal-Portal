'use client'

import { useEffect, useState, useCallback } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { KanbanColumn } from './kanban-column'
import { KanbanTodo } from './kanban-card'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

type ColumnId = 'todo' | 'progress' | 'done'

const COLUMNS: { id: ColumnId; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'progress', title: 'In Progress' },
    { id: 'done', title: 'Completed' },
]

const urgencyDots = [
    { value: 'light' as const, color: '#D4A017', label: 'Light' },
    { value: 'medium' as const, color: '#C35214', label: 'Medium' },
    { value: 'urgent' as const, color: '#803E2F', label: 'Urgent' },
]

export function KanbanBoard() {
    const [todos, setTodos] = useState<KanbanTodo[]>([])
    const [loading, setLoading] = useState(true)
    const [newTitle, setNewTitle] = useState('')
    const [newUrgency, setNewUrgency] = useState<'light' | 'medium' | 'urgent'>('light')
    const { user } = useAuth()
    const supabase = createClient()

    const fetchTodos = useCallback(async () => {
        if (!user) return
        try {
            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setTodos((data || []).map((row: Record<string, unknown>) => ({
                id: row.id as string,
                title: (row.title ?? '') as string,
                status: (row.completed ? 'done' : 'todo') as 'todo' | 'progress' | 'done',
                urgency: (row.urgency ?? 'light') as 'light' | 'medium' | 'urgent',
                created_at: row.created_at as string,
            })))
        } catch (error) {
            console.error('Error fetching todos:', error)
            toast.error('Failed to load tasks')
        } finally {
            setLoading(false)
        }
    }, [user, supabase])

    useEffect(() => {
        fetchTodos()
    }, [fetchTodos])

    // ── Drag & Drop ──
    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result
        if (!destination) return
        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const newStatus = destination.droppableId as ColumnId
        const now = new Date().toISOString()

        // Optimistic update
        setTodos(prev =>
            prev.map(t =>
                t.id === draggableId ? { ...t, status: newStatus } : t
            )
        )

        try {
            const completed = newStatus === 'done'
            const { error } = await supabase
                .from('todos')
                .update({ completed })
                .eq('id', draggableId)

            if (error) throw error
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to move task')
            fetchTodos()
        }
    }

    // ── Quick Add ──
    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTitle.trim() || !user) return

        const optimisticId = `temp-${Date.now()}`
        const optimisticTodo: KanbanTodo = {
            id: optimisticId,
            title: newTitle.trim(),
            status: 'todo',
            urgency: newUrgency,
            created_at: new Date().toISOString(),
        }

        setTodos(prev => [optimisticTodo, ...prev])
        const savedTitle = newTitle.trim()
        const savedUrgency = newUrgency
        setNewTitle('')
        setNewUrgency('light')

        try {
            const { data, error } = await supabase
                .from('todos')
                .insert({
                    title: savedTitle,
                    user_id: user.id,
                    urgency: savedUrgency,
                })
                .select('*')
                .single()

            if (error) throw error

            const row = data as Record<string, unknown>
            setTodos(prev =>
                prev.map(t => t.id === optimisticId ? {
                    id: row.id as string,
                    title: (row.title ?? '') as string,
                    status: 'todo' as const,
                    urgency: (row.urgency ?? 'light') as 'light' | 'medium' | 'urgent',
                    created_at: row.created_at as string,
                } : t)
            )
            toast.success('Task added')
        } catch (error) {
            console.error('Error adding todo:', error)
            setTodos(prev => prev.filter(t => t.id !== optimisticId))
            toast.error('Failed to add task')
        }
    }

    // ── Delete ──
    const handleDelete = async (id: string) => {
        const prev = [...todos]
        setTodos(current => current.filter(t => t.id !== id))

        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id)

            if (error) throw error
            toast.success('Task deleted')
        } catch (error) {
            setTodos(prev)
            console.error('Error deleting todo:', error)
            toast.error('Failed to delete task')
        }
    }

    // ── Group by column ──
    const getColumnTodos = (columnId: ColumnId) =>
        todos.filter(t => t.status === columnId)

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
            </div>
        )
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-grid">
                {COLUMNS.map(col => (
                    <KanbanColumn
                        key={col.id}
                        columnId={col.id}
                        title={col.title}
                        todos={getColumnTodos(col.id)}
                        onDelete={handleDelete}
                    >
                        {col.id === 'todo' && (
                            <form onSubmit={handleQuickAdd} className="kanban-quick-add">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        placeholder="Add task…"
                                        className="kanban-quick-input flex-1"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newTitle.trim()}
                                        className="flex-shrink-0 p-1 rounded-md hover:bg-white/5 disabled:opacity-30 transition-opacity"
                                    >
                                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mr-1">
                                        Priority
                                    </span>
                                    {urgencyDots.map(dot => (
                                        <button
                                            key={dot.value}
                                            type="button"
                                            onClick={() => setNewUrgency(dot.value)}
                                            className="group relative p-0.5"
                                            title={dot.label}
                                        >
                                            <motion.span
                                                animate={{
                                                    scale: newUrgency === dot.value ? 1.4 : 1,
                                                    opacity: newUrgency === dot.value ? 1 : 0.4,
                                                }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                                className="block h-[10px] w-[10px] rounded-full"
                                                style={{ background: dot.color }}
                                            />
                                            {newUrgency === dot.value && (
                                                <motion.span
                                                    layoutId="urgency-ring"
                                                    className="absolute inset-[-2px] rounded-full border"
                                                    style={{ borderColor: dot.color }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </form>
                        )}
                    </KanbanColumn>
                ))}
            </div>
        </DragDropContext>
    )
}
