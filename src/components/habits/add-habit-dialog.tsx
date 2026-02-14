'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

export function AddHabitDialog({ onHabitAdded }: { onHabitAdded: () => void }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()
    const supabase = createClient()

    async function onSubmit() {
        if (!name.trim()) {
            toast.error('Please enter a habit name')
            return
        }
        if (!user?.id) {
            toast.error('Not authenticated')
            return
        }

        setLoading(true)

        const { error } = await supabase.from('habits').insert({
            user_id: user.id,
            name: name.trim(),
            type: 'boolean',
            goal_value: 1,
            current_value: 0,
        })

        if (error) {
            console.error('Insert error:', error)
            toast.error('Failed to add habit', { description: error.message })
        } else {
            toast.success('Habit added')
            setOpen(false)
            setName('')
            onHabitAdded()
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="min-h-[44px] bg-primary text-primary-foreground hover:opacity-90">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Habit
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">New Habit</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Add a daily check-in habit. One tap to complete.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="habit-name" className="text-foreground font-light">Name</Label>
                        <Input
                            id="habit-name"
                            placeholder="e.g., Morning Run"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                            className="border-border bg-transparent text-foreground"
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onSubmit} disabled={loading} className="min-h-[44px] bg-primary text-primary-foreground hover:opacity-90">
                        {loading ? 'Adding...' : 'Add Habit'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
