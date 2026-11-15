import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Video, Zap, Mail, Phone, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getAllServices } from "@/lib/services";

const Support = () => {
  const services = getAllServices();
  const [formData, setFormData] = useState({
    services: [] as string[],
    title: "",
    description: "",
    email: "",
    phone: "",
    urgency: "medium",
    tier: "50",
    terms: false,
  });

  const pricingTiers = [
    {
      icon: MessageSquare,
      price: "€50",
      name: "Quick Question",
      response: "<24 hours",
      channel: "Email + community chat",
      bestFor: "Configuration questions, troubleshooting",
      cta: "Ask a Quick Question",
      value: "50",
      color: "text-primary",
    },
    {
      icon: Video,
      price: "€250",
      name: "Setup Consultation",
      response: "<4 hours",
      channel: "30-minute video call + config review",
      bestFor: "Complex deployments, performance tuning",
      cta: "Book a Consultation",
      value: "250",
      color: "text-accent",
    },
    {
      icon: Zap,
      price: "€500+",
      name: "Full Project",
      response: "Custom scope",
      channel: "Complete setup + 30-day support + optimization",
      bestFor: "Enterprise deployments, custom workflows",
      cta: "Discuss Custom Project",
      value: "500",
      color: "text-primary",
    },
  ];

  const faqs = [
    {
      question: "What's included in each tier?",
      answer: "Quick Question (€50) includes email support and community chat access. Setup Consultation (€250) adds a 30-minute video call and configuration review. Full Project (€500+) provides complete setup assistance, optimization, and 30 days of ongoing support.",
    },
    {
      question: "How do you handle urgent issues?",
      answer: "Mark your request as 'High' urgency and we'll prioritize it. Setup Consultation and Full Project tiers receive priority response times (<4 hours). For critical production issues, consider upgrading to a higher tier for faster support.",
    },
    {
      question: "Can I switch tiers if needed?",
      answer: "Yes! If your issue requires more extensive support than initially expected, we'll discuss upgrading to a higher tier. You'll only pay the difference, and we'll provide a clear scope before proceeding.",
    },
    {
      question: "What if I need ongoing support?",
      answer: "The Full Project tier includes 30 days of support. For longer-term assistance, we offer monthly retainer packages. Contact us to discuss your specific needs and we'll create a custom support plan.",
    },
    {
      question: "Do you offer refunds?",
      answer: "If we're unable to resolve your issue or you're not satisfied with the consultation, we offer a full refund within 7 days. Your satisfaction is our priority.",
    },
  ];

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((id) => id !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your support request.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please describe your issue in detail.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please provide a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.terms) {
      toast({
        title: "Terms Required",
        description: "Please accept the consultation terms to continue.",
        variant: "destructive",
      });
      return;
    }

    // Build mailto link with pre-populated data
    const tierName = pricingTiers.find((t) => t.value === formData.tier)?.name || "Support Request";
    const serviceNames = formData.services
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    const subject = encodeURIComponent(`[${tierName}] ${formData.title}`);
    const body = encodeURIComponent(`
Support Request Details:
========================

Tier: ${tierName} (${pricingTiers.find((t) => t.value === formData.tier)?.price})
Urgency: ${formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)}

Services Involved:
${serviceNames || "Not specified"}

Issue Description:
${formData.description}

Contact Information:
Email: ${formData.email}
Phone: ${formData.phone || "Not provided"}

---
This request was generated via MinBit Portal Support Form.
I understand this is a consultation request and pricing will be confirmed before work begins.
    `.trim());

    const mailtoLink = `mailto:support@minbit.dev?subject=${subject}&body=${body}`;

    // Open user's email client
    window.location.href = mailtoLink;

    // Show success message
    toast({
      title: "Email Client Opened",
      description: "Your support request has been pre-filled. Please send the email to complete your submission.",
    });

    // Reset form after slight delay
    setTimeout(() => {
      setFormData({
        services: [],
        title: "",
        description: "",
        email: "",
        phone: "",
        urgency: "medium",
        tier: "50",
        terms: false,
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Professional Support
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Get expert help with your MinBit deployments. From quick questions to full project setups.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left: Pricing Tiers */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold mb-6">Support Tiers</h2>
            {pricingTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card
                  key={tier.value}
                  className={`transition-all ${
                    formData.tier === tier.value
                      ? "ring-2 ring-primary shadow-lg"
                      : "hover:shadow-md"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className={`h-8 w-8 ${tier.color}`} />
                      <div className="text-right">
                        <div className="text-2xl font-bold">{tier.price}</div>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.bestFor}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Response:</span> {tier.response}
                      </div>
                      <div>
                        <span className="font-medium">Channel:</span> {tier.channel}
                      </div>
                    </div>
                    <Button
                      variant={formData.tier === tier.value ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setFormData((prev) => ({ ...prev, tier: tier.value }))}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Right: Support Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Submit Support Request</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll open your email client with a pre-filled message
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Services Involved */}
                  <div className="space-y-3">
                    <Label>Service(s) Involved (optional)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-md">
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={service.id}
                            checked={formData.services.includes(service.id)}
                            onCheckedChange={() => handleServiceToggle(service.id)}
                          />
                          <label
                            htmlFor={service.id}
                            className="text-sm cursor-pointer"
                          >
                            {service.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Issue Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Issue Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Brief summary of your issue"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Detailed Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your issue in detail. Include error messages, configuration details, and what you've already tried..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={6}
                      required
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Your Email <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, email: e.target.value }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="pl-10"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, phone: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Urgency */}
                  <div className="space-y-3">
                    <Label>Urgency Level</Label>
                    <RadioGroup
                      value={formData.urgency}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, urgency: value }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="low" />
                        <Label htmlFor="low" className="font-normal cursor-pointer">
                          Low - Can wait a few days
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="font-normal cursor-pointer">
                          Medium - Need help this week
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high" />
                        <Label htmlFor="high" className="font-normal cursor-pointer">
                          High - Urgent production issue
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-2 p-4 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={formData.terms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, terms: checked as boolean }))
                      }
                    />
                    <div className="space-y-1">
                      <Label htmlFor="terms" className="font-normal cursor-pointer text-sm">
                        I understand this is a consultation request <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Pricing will be confirmed before work begins. You can cancel anytime before work starts.
                      </p>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button type="submit" size="lg" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Support Request
                  </Button>

                  <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Clicking submit will open your email client with a pre-filled message to support@minbit.dev
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Common questions about our support services
              </p>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
