'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { Plus, Trash2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type VisionItem = {
    id: string
    image_url: string
    caption: string
    position: number
}

export function VisionBoard() {
    const [items, setItems] = useState<VisionItem[]>([])
    const [loading, setLoading] = useState(true)
    const [addOpen, setAddOpen] = useState(false)
    const [url, setUrl] = useState('')
    const [caption, setCaption] = useState('')
    const [adding, setAdding] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const { user } = useAuth()
    const supabase = createClient()

    const fetchItems = useCallback(async () => {
        if (!user) return
        const { data } = await supabase
            .from('vision_board_items')
            .select('*')
            .order('position', { ascending: true })
        setItems(data || [])
        setLoading(false)
    }, [user, supabase])

    useEffect(() => {
        if (user) fetchItems()
    }, [user, fetchItems])

    async function addItem() {
        if (!url.trim() || !user?.id) return
        setAdding(true)
        const { error } = await supabase.from('vision_board_items').insert({
            user_id: user.id,
            image_url: url.trim(),
            caption: caption.trim(),
            position: items.length,
        })
        if (error) toast.error('Failed to add item')
        else { toast.success('Added'); setAddOpen(false); setUrl(''); setCaption(''); fetchItems() }
        setAdding(false)
    }

    async function handleDelete() {
        if (!deleteId) return
        const { error } = await supabase.from('vision_board_items').delete().eq('id', deleteId)
        if (error) toast.error('Failed to delete')
        else { toast.success('Removed'); fetchItems() }
        setDeleteId(null)
    }

    if (loading) return <Skeleton className="h-48 w-full rounded-xl" />

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Vision Board</h3>
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                            <Plus className="mr-1 h-3.5 w-3.5" /> Add
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-panel border-border">
                        <DialogHeader>
                            <DialogTitle className="text-foreground">Add to Vision Board</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-3 py-3">
                            <Input
                                placeholder="Image URL"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="border-border bg-transparent text-foreground"
                            />
                            <Input
                                placeholder="Caption (optional)"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="border-border bg-transparent text-foreground"
                            />
                            <Button onClick={addItem} disabled={adding} className="bg-primary text-primary-foreground hover:opacity-90">
                                {adding ? 'Adding...' : 'Add Image'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {items.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-xl text-sm font-light text-muted-foreground" style={{ border: '1px dashed var(--border)' }}>
                    <ImageIcon className="mr-2 h-4 w-4" /> Add images to visualize your goals
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative aspect-square overflow-hidden rounded-lg"
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.caption || 'Vision'}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-2">
                                        <span className="text-[11px] font-light text-white/90 line-clamp-1">{item.caption}</span>
                                        <button
                                            onClick={() => setDeleteId(item.id)}
                                            className="rounded-full bg-black/30 p-1 text-white/80 transition hover:text-red-400"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Remove Image"
                description="Remove this image from your vision board?"
                onConfirm={handleDelete}
                confirmLabel="Remove"
                destructive
            />
        </div>
    )
}
