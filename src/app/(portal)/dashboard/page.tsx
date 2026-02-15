'use client'

import { VisionBoard } from '@/components/dashboard/vision-board'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { TodaySchedule } from '@/components/dashboard/today-schedule'
import { DailyReport } from '@/components/dashboard/daily-report'
import { TodoList } from '@/components/todo/todo-list'
import { FadeIn } from '@/components/motion/motion-list'

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-light tracking-tight text-[#A79986]">Dashboard</h2>
                    <span className="text-xs font-light text-muted-foreground">{new Date().toLocaleDateString()}</span>
                </div>
            </FadeIn>

            {/* Hero: Vision Board */}
            <FadeIn delay={0.1}>
                <VisionBoard />
            </FadeIn>

            {/* Report Row: Progress Circle + Weekly Chart */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FadeIn delay={0.2}>
                    <DailyReport />
                </FadeIn>
                <FadeIn delay={0.3} className="lg:col-span-2">
                    <PerformanceChart />
                </FadeIn>
            </div>

            {/* Schedule & Tasks Row */}
            <div className="grid gap-6 md:grid-cols-2">
                <FadeIn delay={0.4}>
                    <TodaySchedule />
                </FadeIn>
                <FadeIn delay={0.5}>
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground px-1">Quick Tasks</h3>
                        <div className="rounded-xl p-5 min-h-[200px]" style={{ border: '1px solid var(--border)' }}>
                            <TodoList category="all" />
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    )
}
