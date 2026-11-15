import { useState } from 'react';
import { Mail, Sparkles, MessageSquare, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Agent = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission (replace with actual email capture logic)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const features = [
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'AI-powered service selection based on your goals and infrastructure',
    },
    {
      icon: MessageSquare,
      title: 'Instant Support',
      description: 'Get help with deployment, configuration, and troubleshooting in real-time',
    },
    {
      icon: Zap,
      title: 'Optimization Tips',
      description: 'Personalized guidance for performance tuning your specific stack',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <Badge variant="outline" className="text-sm px-4 py-1">
            Coming Soon
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold font-mono">
            <span className="text-primary">MinBit</span>{' '}
            <span className="text-foreground">AI Assistant</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Intelligent stack recommendations, troubleshooting assistance, and deployment 
            optimization powered by AI. Your personal guide to self-hosted AI infrastructure.
          </p>
        </div>

        {/* Email Signup Card */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 max-w-md mx-auto mb-16 shadow-lg">
          <h2 className="text-xl font-semibold text-center mb-6">
            Be the First to Know
          </h2>

          {submitted ? (
            <div className="text-center py-4" role="status" aria-live="polite">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Check className="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <p className="text-primary font-medium mb-2">
                You're on the list!
              </p>
              <p className="text-sm text-muted-foreground">
                We'll notify you when the AI Assistant is ready for early access.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                  className="w-full focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <Button
                type="submit"
                className="w-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Mail className="w-4 h-4 mr-2 animate-pulse" aria-hidden="true" />
                    Signing up...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                    Notify Me
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* What to Expect */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">What to Expect</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Use case analysis</p>
                <p className="text-sm text-muted-foreground">Describe your goals, get tailored recommendations</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Dependency resolution</p>
                <p className="text-sm text-muted-foreground">Automatic detection and suggestions for required services</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Resource planning</p>
                <p className="text-sm text-muted-foreground">Hardware recommendations based on your stack</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Troubleshooting help</p>
                <p className="text-sm text-muted-foreground">AI-powered diagnostics for common issues</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground mt-16">
          Part of the <span className="text-primary font-mono">MinBit</span> Portal • 
          Open-source AI infrastructure made simple
        </p>
      </div>
    </main>
  );
};

export default Agent;
