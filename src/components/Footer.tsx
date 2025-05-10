
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-border/40 bg-background py-8">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">ComplexSuji</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Understand your code's efficiency in seconds with AI-powered time and space complexity analysis.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="mt-2 flex flex-col space-y-2">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Home</a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground">About</a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Connect</h3>
            <div className="mt-2 flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border/40 pt-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ComplexSuji. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
