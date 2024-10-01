import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Code, Moon, Sun, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Header({ mounted }: { mounted: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="w-full z-10 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a className="flex items-center space-x-2" href="#">
          <Code className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">Hackwoo-ai</span>
        </a>
        <nav className="hidden md:flex space-x-6">
          {['features', 'how-it-works', 'testimonials', 'faq'].map((item) => (
            <a key={item} className="text-sm font-medium hover:text-primary transition-colors" href={`#${item}`}>
              {item.replace(/-/g, ' ')}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col space-y-4 p-4">
            {['features', 'how-it-works', 'testimonials', 'faq'].map((item) => (
              <a key={item} className="text-sm font-medium hover:text-primary transition-colors" href={`#${item}`}>
                {item.replace(/-/g, ' ')}
              </a>
            ))}
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm" className="justify-start">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="justify-start"
              >
                {resolvedTheme === "dark" ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
                {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}