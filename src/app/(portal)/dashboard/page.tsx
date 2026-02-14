'use client'

import { VisionBoard } from '@/components/dashboard/vision-board'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { TodaySchedule } from '@/components/dashboard/today-schedule'
import { DailyReport } from '@/components/dashboard/daily-report'
import { FadeIn } from '@/components/motion/motion-list'

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <FadeIn>
                <h2 className="text-2xl font-bold tracking-tight text-[#A79986]">Dashboard</h2>
            </FadeIn>

            {/* Hero: Vision Board */}
            <FadeIn delay={0.1}>
                <VisionBoard />
            </FadeIn>

            {/* Report Row: Progress Circle + Weekly Chart + Schedule */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FadeIn delay={0.2}>
                    <DailyReport />
                </FadeIn>
                <FadeIn delay={0.3} className="lg:col-span-2">
                    <PerformanceChart />
                </FadeIn>
            </div>

            <FadeIn delay={0.4}>
                <TodaySchedule />
            </FadeIn>
        </div>
    )
}
