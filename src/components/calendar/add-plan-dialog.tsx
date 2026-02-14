'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { CalendarPlus } from 'lucide-react'

const URGENCY_LEVELS = [
    { value: 'light', label: 'Light Urgent', color: '#ca8a04' },
    { value: 'medium', label: 'Intermediate', color: '#ea580c' },
    { value: 'high', label: 'Very Urgent', color: '#dc2626' },
]

export function AddPlanDialog({
    onPlanAdded,
    initialDate,
}: {
    onPlanAdded: () => void
    initialDate?: Date
}) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [date, setDate] = useState(
        initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    )
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('10:00')
    const [urgency, setUrgency] = useState('medium')
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()
    const supabase = createClient()

    async function onSubmit() {
        if (!title.trim()) {
            toast.error('Please enter a title')
            return
        }
        if (!user?.id) return
        setLoading(true)

        const startDateTime = new Date(`${date}T${startTime}:00`).toISOString()
        const endDateTime = new Date(`${date}T${endTime}:00`).toISOString()

        const { error } = await supabase.from('calendar_plans').insert({
            user_id: user.id,
            title: title.trim(),
            start_time: startDateTime,
            end_time: endDateTime,
            category: urgency,
        })

        if (error) {
            toast.error('Failed to add plan', { description: error.message })
        } else {
            toast.success('Plan added')
            setOpen(false)
            setTitle('')
            setUrgency('medium')
            onPlanAdded()
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="min-h-[44px] bg-primary text-primary-foreground hover:opacity-90">
                    <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                    Add Plan
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">New Plan</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Schedule a session with urgency level.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label className="text-foreground font-light">Title</Label>
                        <Input
                            placeholder="e.g., Study Session"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border-border bg-transparent text-foreground"
                            autoFocus
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-foreground font-light">Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border-border bg-transparent text-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label className="text-foreground font-light">Start</Label>
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="border-border bg-transparent text-foreground"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-foreground font-light">End</Label>
                            <Input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="border-border bg-transparent text-foreground"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-foreground font-light">Urgency</Label>
                        <Select value={urgency} onValueChange={setUrgency}>
                            <SelectTrigger className="border-border bg-transparent text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-card">
                                {URGENCY_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: level.color }}
                                            />
                                            {level.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onSubmit} disabled={loading} className="min-h-[44px] bg-primary text-primary-foreground hover:opacity-90">
                        {loading ? 'Adding...' : 'Add Plan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
