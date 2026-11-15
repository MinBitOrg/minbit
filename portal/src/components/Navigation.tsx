import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      root.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    window.document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/marketplace", label: "Marketplace" },
    { path: "/wizard", label: "Wizard" },
    { path: "/support", label: "Support" },
    { path: "/docs", label: "Docs" },
    { path: "/agent", label: "AI Assistant", badge: "Preview" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
          aria-label="MinBit Portal home"
        >
          <span className="font-mono text-xl font-bold">
            <span className="text-primary">Min</span>
            <span className="text-accent">Bit</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm flex items-center gap-1.5 ${
                isActive(link.path) ? "text-primary" : "text-muted-foreground"
              }`}
              aria-current={isActive(link.path) ? "page" : undefined}
            >
              {link.path === "/agent" && <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />}
              {link.label}
              {link.badge && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                  {link.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>

        {/* Theme Toggle + Mobile Menu */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-border">
          <div className="container py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm flex items-center gap-2 ${
                  isActive(link.path) ? "text-primary" : "text-muted-foreground"
                }`}
                aria-current={isActive(link.path) ? "page" : undefined}
              >
                {link.path === "/agent" && <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />}
                {link.label}
                {link.badge && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                    {link.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
