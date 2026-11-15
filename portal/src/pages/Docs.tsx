import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Rocket,
  Database,
  Wrench,
  HeartHandshake,
  Server,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const Docs = () => {
  const sections = [
    {
      icon: Rocket,
      title: "Getting Started",
      description: "First time? Start here with our 5-minute quickstart guide.",
      href: "/docs/getting-started",
      color: "text-primary",
    },
    {
      icon: Database,
      title: "Service Directory",
      description: "Complete reference for all 18+ services in the MinBit catalog.",
      href: "/docs/services",
      color: "text-accent",
    },
    {
      icon: Wrench,
      title: "Installation & Deployment",
      description: "Docker Compose, Kubernetes, and manual setup guides.",
      href: "/docs/installation",
      color: "text-primary",
    },
    {
      icon: Server,
      title: "Troubleshooting",
      description: "Common issues and how to fix them quickly.",
      href: "/docs/troubleshooting",
      color: "text-accent",
    },
    {
      icon: BookOpen,
      title: "Self-Hosting MinBit",
      description: "Run MinBit Portal on your own infrastructure.",
      href: "/docs/self-hosting",
      color: "text-primary",
    },
    {
      icon: HeartHandshake,
      title: "Contributing",
      description: "Help improve MinBit Portal and add new services.",
      href: "/docs/contributing",
      color: "text-accent",
    },
  ];

  const quickLinks = [
    { label: "What is MinBit?", href: "/docs/getting-started#what-is-minbit" },
    { label: "How to use the Wizard", href: "/docs/getting-started#wizard-walkthrough" },
    { label: "Docker basics", href: "/docs/installation#docker-basics" },
    { label: "Port conflicts", href: "/docs/troubleshooting#port-conflicts" },
    { label: "GPU setup", href: "/docs/installation#gpu-setup" },
    { label: "Add a new service", href: "/docs/contributing#adding-services" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Documentation</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Everything you need to know about MinBit Portal. From quickstart guides to advanced configurations.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="border-b border-border bg-muted/20">
        <div className="container py-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-sm font-medium text-muted-foreground mr-2">Quick links:</span>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="text-sm text-primary hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="container py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.href} to={section.href}>
                  <Card className="h-full transition-all hover:shadow-lg hover:scale-105">
                    <CardHeader>
                      <Icon className={`h-10 w-10 mb-2 ${section.color}`} />
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full justify-between group">
                        Read More
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Additional Resources</h2>
              <p className="text-muted-foreground">
                External resources and community links
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href="https://github.com/minbit-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="transition-all hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      GitHub Repository
                      <ExternalLink className="h-4 w-4" />
                    </CardTitle>
                    <CardDescription>
                      View source code, report issues, and contribute
                    </CardDescription>
                  </CardHeader>
                </Card>
              </a>
              <a
                href="https://discord.gg/minbit"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="transition-all hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Discord Community
                      <ExternalLink className="h-4 w-4" />
                    </CardTitle>
                    <CardDescription>
                      Get help, share configs, and connect with others
                    </CardDescription>
                  </CardHeader>
                </Card>
              </a>
              <Link to="/support" className="block">
                <Card className="transition-all hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Professional Support
                      <ArrowRight className="h-4 w-4" />
                    </CardTitle>
                    <CardDescription>
                      Paid consulting and setup assistance
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <a
                href="https://blog.minbit.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="transition-all hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Blog & Tutorials
                      <ExternalLink className="h-4 w-4" />
                    </CardTitle>
                    <CardDescription>
                      In-depth guides and use case examples
                    </CardDescription>
                  </CardHeader>
                </Card>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Docs;
