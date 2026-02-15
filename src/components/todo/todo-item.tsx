'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface Todo {
    id: string
    title: string
    completed: boolean
    urgency: 'light' | 'medium' | 'urgent'
}

interface TodoItemProps {
    todo: Todo
    onToggle: (id: string, completed: boolean) => void
    onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        await onDelete(todo.id)
        setIsDeleting(false)
    }

    return (
        <div className="sheet-item group">
            <div className="flex items-center gap-3 flex-1">
                <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={(checked) => onToggle(todo.id, checked as boolean)}
                    className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <div className="flex flex-col gap-0.5">
                    <label
                        htmlFor={`todo-${todo.id}`}
                        className={cn(
                            'text-sm font-medium leading-none cursor-pointer transition-colors',
                            todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        )}
                    >
                        {todo.title}
                    </label>
                    <span className={cn(
                        "urgency-pill w-fit text-[10px]",
                        todo.urgency === 'light' && "urgency-light",
                        todo.urgency === 'medium' && "urgency-medium",
                        todo.urgency === 'urgent' && "urgency-high",
                    )}>
                        {todo.urgency.toUpperCase()}
                    </span>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-transparent"
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>
        </div>
    )
}
