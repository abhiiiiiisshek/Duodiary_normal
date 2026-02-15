'use client'

import { useTheme } from '@/components/theme-provider'
import { motion } from 'framer-motion'
import { Check, Settings2, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const colors = [
    { name: 'Zinc', value: '240 5.9% 10%' },
    { name: 'Slate', value: '215.4 16.3% 46.9%' },
    { name: 'Stone', value: '25 5.3% 44.7%' },
    { name: 'Red', value: '0 84.2% 60.2%' },
    { name: 'Orange', value: '24.6 95% 53.1%' },
    { name: 'Amber', value: '38 92% 50%' },
    { name: 'Yellow', value: '45.4 93.4% 47.5%' },
    { name: 'Lime', value: '84.8 85.2% 34.5%' },
    { name: 'Green', value: '142.1 76.2% 36.3%' },
    { name: 'Emerald', value: '160.1 84.1% 39.4%' },
    { name: 'Teal', value: '175.9 60.8% 19.7%' },
    { name: 'Cyan', value: '189.4 94.5% 38.6%' },
    { name: 'Sky', value: '199 89% 48%' },
    { name: 'Blue', value: '221.2 83.2% 53.3%' },
    { name: 'Indigo', value: '226 70% 55.5%' },
    { name: 'Violet', value: '262.1 83.3% 57.8%' },
    { name: 'Purple', value: '268.7 83.9% 67.1%' },
    { name: 'Fuchsia', value: '292.2 84.1% 60.6%' },
    { name: 'Pink', value: '335.1 77.6% 50.6%' },
    { name: 'Rose', value: '346.8 77.2% 49.8%' },
]

export function ThemeConfigurator() {
    const { config, updateTheme, saveTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 transition-transform z-50"
            >
                <Settings2 className="h-6 w-6" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card w-full max-w-lg rounded-xl border shadow-xl p-6 relative overflow-y-auto max-h-[90vh]"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-xl font-bold mb-6">Customize Theme</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium mb-3">Primary Color</h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => updateTheme({ primary: color.value })}
                                            className={cn(
                                                "h-10 rounded-md border flex items-center justify-center transition-all",
                                                config.primary === color.value ? "ring-2 ring-offset-2 ring-primary" : "hover:scale-105"
                                            )}
                                            style={{ backgroundColor: `hsl(${color.value})` }}
                                        >
                                            {config.primary === color.value && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-3">Border Radius</h3>
                                <div className="flex gap-2">
                                    {['0', '0.3rem', '0.5rem', '0.75rem', '1rem'].map((radius) => (
                                        <button
                                            key={radius}
                                            onClick={() => updateTheme({ radius })}
                                            className={cn(
                                                "h-10 w-10 border rounded-md flex items-center justify-center transition-all",
                                                config.radius === radius ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                            )}
                                        >
                                            <div className="w-4 h-4 border-2 border-current border-t-0 border-l-0" style={{ borderRadius: radius === '0' ? '0' : '0.2rem' }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t flex justify-end">
                                <button
                                    onClick={() => {
                                        saveTheme()
                                        setIsOpen(false)
                                    }}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    )
}
