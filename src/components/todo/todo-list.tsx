'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TodoItem } from './todo-item'
import { AddTodo } from './add-todo'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface Todo {
    id: string
    title: string
    completed: boolean
    created_at: string
    completed_at: string | null
    urgency: 'light' | 'medium' | 'urgent'
}

export function TodoList({ category }: { category: string }) {
    const [todos, setTodos] = useState<Todo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchTodos()
    }, [category])

    const fetchTodos = async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const query = supabase
                .from('todos')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            const { data, error } = await query

            if (error) throw error
            setTodos(data as Todo[] || [])
        } catch (error) {
            console.error('Error fetching todos:', error)
            toast.error('Failed to load tasks')
        } finally {
            setIsLoading(false)
        }
    }

    const addTodo = async (title: string, urgency: 'light' | 'medium' | 'urgent') => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('You must be logged in')
                return
            }

            const { data, error } = await supabase
                .from('todos')
                .insert([{
                    title,
                    user_id: user.id,
                    urgency
                }])
                .select()
                .single()

            if (error) throw error

            setTodos([data as Todo, ...todos])
            toast.success('Task added')
        } catch (error) {
            console.error('Error adding todo:', error)
            toast.error('Failed to add task')
        }
    }

    const toggleTodo = async (id: string, completed: boolean) => {
        // Optimistic update
        const now = new Date().toISOString()
        setTodos(current =>
            current.map(t => t.id === id ? { ...t, completed, completed_at: completed ? now : null } : t)
        )

        try {
            const { error } = await supabase
                .from('todos')
                .update({
                    completed,
                    completed_at: completed ? now : null
                })
                .eq('id', id)

            if (error) {
                // Revert on error
                setTodos(current =>
                    current.map(t => t.id === id ? { ...t, completed: !completed, completed_at: !completed ? null : t.completed_at } : t)
                )
                throw error
            }
        } catch (error) {
            console.error('Error updating todo:', error)
            toast.error('Failed to update task')
        }
    }

    const deleteTodo = async (id: string) => {
        // Optimistic update
        const previousTodos = [...todos]
        setTodos(current => current.filter(t => t.id !== id))

        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id)

            if (error) {
                setTodos(previousTodos)
                throw error
            }
            toast.success('Task deleted')
        } catch (error) {
            console.error('Error deleting todo:', error)
            toast.error('Failed to delete task')
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <AddTodo onAdd={addTodo} />

            <div className="space-y-3">
                {todos.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground font-light text-sm">
                        No tasks yet. Add one to get started!
                    </div>
                ) : (
                    <div className="sheet-list">
                        {todos.map((todo, index) => (
                            <div key={todo.id}>
                                <TodoItem
                                    todo={todo}
                                    onToggle={toggleTodo}
                                    onDelete={deleteTodo}
                                />
                                {index < todos.length - 1 && <div className="sheet-separator" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
