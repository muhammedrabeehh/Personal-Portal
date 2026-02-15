'use client'

import { Droppable } from '@hello-pangea/dnd'
import { KanbanCard, KanbanTodo } from './kanban-card'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
    columnId: string
    title: string
    todos: KanbanTodo[]
    onDelete: (id: string) => void
    children?: React.ReactNode  // For quick-add input in "To Do" column
}

const columnStyles: Record<string, { border: string; text: string }> = {
    todo: { border: 'border-t-[#C35214]/50', text: 'text-[#C35214]' },
    progress: { border: 'border-t-[#D4A017]/50', text: 'text-[#D4A017]' },
    done: { border: 'border-t-[#2ECC71]/50', text: 'text-[#2ECC71]' },
}

export function KanbanColumn({ columnId, title, todos, onDelete, children }: KanbanColumnProps) {
    const style = columnStyles[columnId] || { border: 'border-t-transparent', text: 'text-muted-foreground' }

    return (
        <div className={cn(
            'kanban-column flex flex-col border-t-2',
            style.border
        )}>
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h3 className={cn(
                    "text-[11px] font-medium uppercase tracking-[0.15em]",
                    style.text
                )}>
                    {title}
                </h3>
                <span className={cn(
                    "text-[10px] font-light tabular-nums opacity-60",
                    style.text
                )}>
                    {todos.length}
                </span>
            </div>

            {/* Quick Add (only in "To Do" column) */}
            {children && (
                <div className="px-3 pb-2">
                    {children}
                </div>
            )}

            {/* Droppable Area */}
            <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            'flex-1 px-3 pb-3 space-y-2 min-h-[120px] transition-colors duration-200 rounded-b-xl',
                            snapshot.isDraggingOver && 'bg-white/[0.02]'
                        )}
                    >
                        {todos.length === 0 && !snapshot.isDraggingOver && (
                            <div className="flex items-center justify-center h-20 text-[11px] text-muted-foreground/40 font-light">
                                Drop tasks here
                            </div>
                        )}
                        {todos.map((todo, index) => (
                            <KanbanCard
                                key={todo.id}
                                todo={todo}
                                index={index}
                                onDelete={onDelete}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}
