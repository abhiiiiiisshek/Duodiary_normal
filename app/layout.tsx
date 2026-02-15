import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeConfigurator } from '@/components/theme-configurator'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'DualDiary',
    description: 'A premium private diary for two.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={cn(inter.className, "antialiased min-h-screen bg-background text-foreground transition-colors duration-300")}>
                <ThemeProvider>
                    {children}
                    <ThemeConfigurator />
                </ThemeProvider>
            </body>
        </html>
    )
}
