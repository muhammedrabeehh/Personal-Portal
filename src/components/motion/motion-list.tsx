'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import React from 'react'

// ───────────────────────────────────────────
// STAGGER CONTAINER + ITEM
// ───────────────────────────────────────────
const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
        },
    },
}

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
        },
    },
}

export function StaggerContainer({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <motion.div variants={staggerItem} className={className}>
            {children}
        </motion.div>
    )
}

// ───────────────────────────────────────────
// SPRING SCALE BUTTON
// ───────────────────────────────────────────
export function MotionButton({
    children,
    className,
    onClick,
    disabled,
    type = 'button',
    ...props
}: HTMLMotionProps<'button'> & {
    children: React.ReactNode
    className?: string
    onClick?: () => void
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={className}
            onClick={onClick}
            disabled={disabled}
            type={type}
            {...props}
        >
            {children}
        </motion.button>
    )
}

// ───────────────────────────────────────────
// FADE IN wrapper
// ───────────────────────────────────────────
export function FadeIn({
    children,
    className,
    delay = 0,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// ───────────────────────────────────────────
// DIGIT TUMBLE (Odometer style)
// ───────────────────────────────────────────
export function DigitTumble({ value }: { value: string }) {
    return (
        <span className="inline-flex overflow-hidden">
            {value.split('').map((char, i) => (
                <motion.span
                    key={`${i}-${char}`}
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 30, opacity: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                        delay: i * 0.02,
                    }}
                    className="inline-block"
                >
                    {char}
                </motion.span>
            ))}
        </span>
    )
}
