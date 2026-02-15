'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AddTodoProps {
    onAdd: (title: string, urgency: 'light' | 'medium' | 'urgent') => Promise<void>
}

export function AddTodo({ onAdd }: AddTodoProps) {
    const [title, setTitle] = useState('')
    const [urgency, setUrgency] = useState<'light' | 'medium' | 'urgent'>('light')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setIsSubmitting(true)
        try {
            await onAdd(title, urgency)
            setTitle('')
            setUrgency('light')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6 items-center">
            <Input
                placeholder="Add a new task..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                disabled={isSubmitting}
            />
            <Select value={urgency} onValueChange={(v: any) => setUrgency(v)}>
                <SelectTrigger className="w-[110px] h-8 text-xs border-none bg-accent/50">
                    <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="light" className="text-yellow-500">Light</SelectItem>
                    <SelectItem value="medium" className="text-orange-500">Medium</SelectItem>
                    <SelectItem value="urgent" className="text-red-500">Urgent</SelectItem>
                </SelectContent>
            </Select>
            <Button type="submit" size="sm" variant="ghost" disabled={isSubmitting || !title.trim()} className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add</span>
            </Button>
        </form>
    )
}
