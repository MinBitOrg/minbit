import { useParams, Link } from "react-router-dom";
import { getServiceById } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Github, Rocket } from "lucide-react";

const complexityColors = {
  beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const categoryLabels = {
  "llm-runners": "LLM Runner",
  "chat-uis": "Chat UI",
  "workflow-agents": "Workflow/Agent",
  "vector-dbs": "Vector DB",
};

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const service = id ? getServiceById(id) : undefined;

  if (!service) {
    return (
      <div className="container py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold">Service Not Found</h1>
          <p className="text-muted-foreground">The service you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {categoryLabels[service.category]}
              </Badge>
              <Badge variant="outline" className={complexityColors[service.complexity]}>
                {service.complexity}
              </Badge>
              {service.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold font-mono">{service.name}</h1>
            <p className="text-xl text-muted-foreground">{service.description}</p>
            
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to={`/wizard?service=${service.id}`}>
                  <Rocket className="mr-2 h-4 w-4" />
                  Add to Stack
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href={service.officialDocs} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Official Docs
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={service.githubRepo} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub Repo
                </a>
              </Button>
            </div>
          </div>

          {/* Long Description */}
          {service.longDescription && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.longDescription}</p>
              </CardContent>
            </Card>
          )}

          {/* Docker Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Docker Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Image</p>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {service.dockerImage}:{service.dockerImageTag}
                </code>
              </div>
              
              {service.ports && service.ports.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Ports</p>
                  <div className="space-y-2">
                    {service.ports.map((port, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <code className="bg-muted px-2 py-1 rounded">
                          {port.host}:{port.container}
                        </code>
                        <span className="text-muted-foreground">- {port.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Options */}
          {service.configOptions && service.configOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Configuration Options</CardTitle>
                <CardDescription>Available environment variables and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {service.configOptions.map((option) => (
                    <div key={option.key} className="border-l-2 border-muted pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono">{option.key}</code>
                        {option.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{option.description}</p>
                      {option.default && (
                        <p className="text-xs text-muted-foreground">
                          Default: <code className="bg-muted px-1 rounded">{option.default}</code>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dependencies */}
          {service.dependencies && service.dependencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dependencies</CardTitle>
                <CardDescription>Services that work well with {service.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {service.dependencies.map((dep) => (
                    <div key={dep.serviceId} className="flex items-center gap-2">
                      <Badge variant="outline">{dep.serviceId}</Badge>
                      {dep.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      {dep.description && <span className="text-sm text-muted-foreground">- {dep.description}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
