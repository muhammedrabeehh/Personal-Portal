'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                toast.error('Authentication failed', { description: error.message })
                return
            }
            toast.success('Signed in successfully')
            router.push('/dashboard')
            router.refresh()
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auroral-bg flex min-h-screen items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="glass-panel w-full max-w-md rounded-2xl p-8 md:p-10"
            >
                <div className="mb-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-3xl font-medium tracking-tight text-foreground"
                    >
                        Discipline
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                        className="mt-2 text-sm font-light text-muted-foreground"
                    >
                        Sign in to your portal
                    </motion.p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="relative"
                    >
                        <input
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                            className="floating-input w-full"
                        />
                        <label htmlFor="email" className="floating-label">Email</label>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="relative"
                    >
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                            className="floating-input w-full"
                        />
                        <label htmlFor="password" className="floating-label">Password</label>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    >
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            type="submit"
                            disabled={isLoading}
                            className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </motion.button>
                    </motion.div>
                </form>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-6 text-center text-sm text-muted-foreground"
                >
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium text-foreground transition-colors hover:text-primary">
                        Sign up
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    )
}
