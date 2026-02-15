'use client'

import { KanbanBoard } from '@/components/todo/kanban-board'
import { FadeIn } from '@/components/motion/motion-list'

export default function TodoPage() {
    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-light tracking-tight text-[#A79986]">To-Do</h2>
                    <span className="text-xs font-light text-muted-foreground">
                        {new Date().toLocaleDateString()}
                    </span>
                </div>
            </FadeIn>

            <FadeIn delay={0.1}>
                <KanbanBoard />
            </FadeIn>
        </div>
    )
}
