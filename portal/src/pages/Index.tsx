import { Link } from "react-router-dom";
import { ArrowRight, Lock, Boxes, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const benefits = [
    {
      icon: Lock,
      title: "Radically Transparent",
      description: "Every tool is open-source, every config is yours. No hidden dependencies, no vendor lock-in.",
    },
    {
      icon: Boxes,
      title: "Modular by Design",
      description: "Pick only what you need, compose your perfect stack. Mix and match services seamlessly.",
    },
    {
      icon: Heart,
      title: "Community-First",
      description: "Built in public, contributions welcome. Sustainable through support, not extraction.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-mono text-primary">
            Open-Source AI Marketplace
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Open-Source AI Tools,
            <br />
            <span className="text-primary">Configured in Minutes</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Build your perfect AI stack with transparency, no vendor lock-in, and community-first values.
            From LLM runners to vector databases — all open-source, all yours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="group">
              <Link to="/marketplace">
                Browse Services
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/wizard">Start Building</Link>
            </Button>
          </div>

          <div className="pt-8">
            <p className="text-sm text-muted-foreground font-mono">
              $ docker-compose up -d
              <span className="ml-2 animate-pulse">▊</span>
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="container py-24">
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to Build Your Stack?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join developers building transparent, sustainable AI infrastructure.
          </p>
          <Button asChild size="lg" className="group">
            <Link to="/wizard">
              Start Configuration Wizard
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm">
                <span className="text-primary">Min</span>
                <span className="text-accent">Bit</span>
              </span>
              <span className="text-sm text-muted-foreground">
                · Open-source under MIT License
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/docs" className="hover:text-primary transition-colors">
                Documentation
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <Link to="/support" className="hover:text-primary transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
