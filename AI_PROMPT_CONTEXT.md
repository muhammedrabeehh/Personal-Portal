# Project Context: Personal Portal

I am working on a "Discipline" Personal Portal project. I need you to understand the entire context of the project so you can help me implement new features or debug existing ones.

## 1. Project Overview

**Mission**: A private, full-stack personal portal optimized for free-tier services, featuring a Dashboard, Habit Tracker, and Integrated Calendar.
**Tech Stack**:
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **Icons**: Lucide React
- **Charts**: Recharts

## 2. dependencies (`package.json`)

```json
{
  "name": "discipline-portal",
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.95.3",
    "class-variance-authority": "^0.7.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.564.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-day-picker": "^9.13.2",
    "recharts": "^3.7.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0"
  }
}
```

## 3. Database Schema (`supabase/schema.sql`)

This authenticates users via Supabase Auth and uses Row Level Security (RLS) to isolate data.

```sql
-- Habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('boolean', 'numeric')) NOT NULL,
  goal_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- Calendar Plans table
CREATE TABLE calendar_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE calendar_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own plans" ON calendar_plans FOR ALL USING (auth.uid() = user_id);

-- Vision Board Items table
CREATE TABLE vision_board_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vision_board_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vision items" ON vision_board_items FOR ALL USING (auth.uid() = user_id);
```

## 4. Authentication Architecture

The app uses `@supabase/ssr` for secure auth handling in Next.js App Router.

**`src/lib/supabase/client.ts`** (Browser Client):
```typescript
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`src/lib/supabase/server.ts`** (Server Client with Cookie Handling):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignored in Server Components
                    }
                },
            },
        }
    )
}
```

**`src/middleware.ts`**:
Protects routes by refreshing the session. Redirects to login if unauthenticated.
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

**`src/components/providers/auth-provider.tsx`**:
React Context to expose the `user` object and `signOut` function globally.
```typescript
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ... (Context definition)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [supabase])

    // ... exports user andsignOut
}
```

## 5. UI Structure

**Layout**:
- `src/app/layout.tsx`: Root layout wrapping app in `<AuthProvider>` and `<Toaster>`.
- `src/app/(portal)/layout.tsx`: Layout for authenticated pages, includes `<Sidebar />`.

**`src/components/layout/sidebar.tsx`**:
Uses `useAuth()` to get user data and handle sign out. Links to:
- `/dashboard`
- `/habits`
- `/calendar`

## 6. Workflow & Instructions

**Environment Setup**:
`.env.local` requires:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**How to Run**:
1. Run SQL migration in Supabase.
2. `npm install`
3. `npm run dev`

**Development Pattern**:
- Create new components in `src/components/[feature]`.
- Use Shadcn UI components from `@/components/ui`.
- Use `createClient()` from `@/lib/supabase/client` for Client Components.
- Use `createClient()` from `@/lib/supabase/server` for Server Components/Actions.

Please use this context when answering my future questions about adding features or fixing bugs.
