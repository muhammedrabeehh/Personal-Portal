'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type KanbanTodo = {
    id: string
    title: string
    status: 'todo' | 'progress' | 'done'
    urgency: 'light' | 'medium' | 'urgent'
    created_at: string
}

const urgencyColors: Record<string, string> = {
    light: '#D4A017',
    medium: '#C35214',
    urgent: '#803E2F',
}

const urgencyLabels: Record<string, string> = {
    light: 'LIGHT',
    medium: 'MEDIUM',
    urgent: 'URGENT',
}

interface KanbanCardProps {
    todo: KanbanTodo
    index: number
    onDelete: (id: string) => void
}

export function KanbanCard({ todo, index, onDelete }: KanbanCardProps) {
    const borderColor = urgencyColors[todo.urgency] || urgencyColors.light

    return (
        <Draggable draggableId={todo.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                        'kanban-card group relative cursor-grab active:cursor-grabbing',
                        snapshot.isDragging && 'z-50 scale-[1.02] shadow-[0_16px_40px_rgba(0,0,0,0.35)]'
                    )}
                    style={{
                        ...provided.draggableProps.style,
                        borderLeft: `3px solid ${borderColor}`,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        {/* Card Content */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    'text-[13px] font-light leading-snug text-foreground',
                                    todo.status === 'done' && 'line-through opacity-50'
                                )}>
                                    {todo.title}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(todo.id)
                                }}
                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/5"
                            >
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive transition-colors" />
                            </button>
                        </div>

                        {/* Urgency Dot */}
                        <div className="mt-2 flex items-center gap-1.5">
                            <span
                                className="h-[6px] w-[6px] rounded-full flex-shrink-0"
                                style={{ background: borderColor }}
                            />
                            <span className="text-[9px] font-medium uppercase tracking-widest" style={{ color: borderColor }}>
                                {urgencyLabels[todo.urgency]}
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </Draggable>
    )
}
