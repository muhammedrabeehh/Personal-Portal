'use client'

import { CalendarView } from '@/components/calendar/calendar-view'
import { FadeIn } from '@/components/motion/motion-list'

export default function CalendarPage() {
    return (
        <div className="space-y-6">
            <FadeIn>
                <h2 className="text-2xl font-bold tracking-tight text-[#A79986]">Calendar</h2>
            </FadeIn>
            <FadeIn delay={0.1}>
                <CalendarView />
            </FadeIn>
        </div>
    )
}
