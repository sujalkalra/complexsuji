
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-primary">
            <span>Complex</span>
            <span className="text-foreground">Suji</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Home</a>
          <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">Features</a>
          <a href="#about" className="text-foreground/80 hover:text-foreground transition-colors">About</a>
          <a href="#contact" className="text-foreground/80 hover:text-foreground transition-colors">Contact</a>
          <ThemeToggle />
        </div>

        {/* Mobile Navigation Button */}
        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="container md:hidden py-4 animate-fade-in">
          <div className="flex flex-col space-y-4">
            <a href="#" 
              className="px-2 py-1 rounded-md text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a href="#features" 
              className="px-2 py-1 rounded-md text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a href="#about" 
              className="px-2 py-1 rounded-md text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a href="#contact" 
              className="px-2 py-1 rounded-md text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
