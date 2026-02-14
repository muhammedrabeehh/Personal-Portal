'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LandingPage() {
  return (
    <div className="auroral-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="space-y-6"
      >
        <h1 className="text-5xl font-medium tracking-tight text-foreground md:text-7xl">
          Discipline
        </h1>
        <p className="mx-auto max-w-md text-lg font-light text-muted-foreground">
          Your personal operating system for building habits, tracking focus, and staying accountable.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/login">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="min-h-[44px] rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-shadow hover:shadow-xl"
            >
              Sign In
            </motion.button>
          </Link>
          <Link href="/signup">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="min-h-[44px] rounded-lg border border-border px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Sign Up
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-8 text-xs text-muted-foreground/50"
      >
        Built with discipline
      </motion.div>
    </div>
  )
}
