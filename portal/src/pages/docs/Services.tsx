import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Search, ExternalLink, Github } from "lucide-react";
import { getAllServices } from "@/lib/services";

const Services = () => {
  const services = getAllServices();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryLabels = {
    "llm-runners": "LLM Runners",
    "chat-uis": "Chat UIs",
    "workflow-agents": "Workflow & Agents",
    "vector-dbs": "Vector Databases",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/docs" className="text-muted-foreground hover:text-primary">
              Docs
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Service Directory</span>
          </div>

          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Service Directory</h1>
            <p className="text-xl text-muted-foreground">
              Complete reference for all {services.length} services in the MinBit catalog.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Separator />

          {/* Services Grid */}
          <div className="space-y-8">
            {Object.entries(categoryLabels).map(([categoryKey, categoryLabel]) => {
              const categoryServices = filteredServices.filter(
                (service) => service.category === categoryKey
              );

              if (categoryServices.length === 0) return null;

              return (
                <section key={categoryKey} className="space-y-4">
                  <h2 className="text-2xl font-bold">{categoryLabel}</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {categoryServices.map((service) => (
                      <Card key={service.id} className="hover:shadow-md transition-all">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <CardTitle className="text-xl">{service.name}</CardTitle>
                              <CardDescription>{service.description}</CardDescription>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              {service.popular && (
                                <Badge variant="default">Popular</Badge>
                              )}
                              {service.recommended && (
                                <Badge variant="secondary">Recommended</Badge>
                              )}
                              <Badge variant="outline" className="capitalize">
                                {service.complexity}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Docker Info */}
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Docker Image:</div>
                            <code className="text-xs bg-muted px-2 py-1 rounded block">
                              {service.dockerImage}:{service.dockerImageTag}
                            </code>
                          </div>

                          {/* Ports */}
                          {service.ports.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Default Ports:</div>
                              <div className="flex flex-wrap gap-2">
                                {service.ports.map((port) => (
                                  <Badge key={port.container} variant="outline">
                                    {port.host}:{port.container}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          {service.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {service.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Links */}
                          <div className="flex gap-2 pt-2">
                            <a
                              href={service.officialDocs}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1"
                            >
                              <Button variant="outline" size="sm" className="w-full">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Docs
                              </Button>
                            </a>
                            <a
                              href={service.githubRepo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1"
                            >
                              <Button variant="outline" size="sm" className="w-full">
                                <Github className="mr-2 h-4 w-4" />
                                GitHub
                              </Button>
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* No Results */}
          {filteredServices.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground">No services found matching "{searchQuery}"</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}

          {/* Back to Docs */}
          <div className="pt-8">
            <Link to="/docs">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
