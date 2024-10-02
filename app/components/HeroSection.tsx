import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HeroSection() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStartHacking = () => {
    router.push('/ai')
  }

  return (
    <section className="container mx-auto px-4 text-center">
      <div>
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Supercharge your <span className="relative inline-block">
            hackathon
            <span className="absolute -bottom-1 left-0 w-full h-2 sm:h-3 bg-yellow-300 -z-10"></span>
          </span> with AI.
        </motion.h1>
        <motion.p
          className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Hackwooai is your AI-powered assistant for hackathons, helping you ideate,
          code, and present your projects faster and more efficiently.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleStartHacking}
          >
            Start hacking with AI
          </Button>
        </motion.div>
      </div>
    </section>
  )
}