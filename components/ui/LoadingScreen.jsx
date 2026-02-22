'use client'

import { useEffect, useRef } from 'react'
import { LoaderIcon } from 'lucide-react'
import gsap from 'gsap'

export default function LoadingScreen() {
    const barRef = useRef(null)

    useEffect(() => {
        if (!barRef.current) return

        // Create a continuous loading bar animation
        const tl = gsap.timeline({ repeat: -1 })

        tl.fromTo(
            barRef.current,
            {
                y: -4,
                opacity: 1,
            },
            {
                y: '100vh',
                opacity: 0,
                duration: 1.5,
                ease: 'power1.inOut',
            }
        )

        return () => tl.kill()
    }, [])

    return (
        <div className="flex items-center justify-center h-full relative overflow-hidden">
            {/* GSAP animated bar */}
            <div ref={barRef} className="absolute left-1/2 -translate-x-1/2 top-0 w-1 h-1 bg-[#2eaadc] rounded-full pointer-events-none" />

            {/* Spinner */}
            <LoaderIcon className="w-6 h-6 text-[#9b9a97] animate-spin" />
        </div>
    )
}
