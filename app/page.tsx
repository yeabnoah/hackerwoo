'use client'

import { useState, useEffect } from 'react'
import { useTheme } from "next-themes"
import Header from './components/Header'
import Footer from './components/Footer'
import HeroSection from './components/HeroSection'
import BackgroundAnimation from './components/BackgroundAnimation'

export default function LandingPage() {
  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const initialTheme = window.localStorage.getItem('theme') || 'system'
    setTheme(initialTheme)
  }, [setTheme])

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 z-0" />
      <BackgroundAnimation />

      {/* <Header mounted={mounted} /> */}

      <main className="flex-1 flex items-center justify-center relative z-1 px-4 py-8 sm:py-12 md:py-16">
        <HeroSection />
      </main>
      

      <Footer />
    </div>
  )
}