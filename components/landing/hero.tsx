'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const subtitleRef = useRef<HTMLParagraphElement>(null)
    const ctaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

            tl.from(titleRef.current, {
                y: 100,
                opacity: 0,
                duration: 1,
                delay: 0.5
            })
                .from(subtitleRef.current, {
                    y: 50,
                    opacity: 0,
                    duration: 0.8
                }, '-=0.6')
                .from(ctaRef.current, {
                    y: 30,
                    opacity: 0,
                    duration: 0.8
                }, '-=0.6')

            // Parallax background or floating elements
            gsap.to('.floating-orb', {
                y: -20,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: 0.5
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-20">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="floating-orb absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                <div className="floating-orb absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
            </div>

            <div className="container px-4 text-center z-10">
                <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Your Private World,<br />Shared with <span className="text-primary">One</span>.
                </h1>

                <p ref={subtitleRef} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                    DualDiary is a premium, intimate space for two people to connect through words.
                    Secure, private, and designed for emotional closeness.
                </p>

                <div ref={ctaRef} className="flex gap-4 justify-center">
                    <Link
                        href="/login"
                        className="group px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
                    >
                        Start Journaling
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/login" // Or Learn More
                        className="px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-medium text-lg hover:bg-secondary/80 transition-colors"
                    >
                        Learn More
                    </Link>
                </div>
            </div>
        </section>
    )
}
