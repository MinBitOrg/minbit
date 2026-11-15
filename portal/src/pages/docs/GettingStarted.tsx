import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Lightbulb, Terminal, Zap, CheckCircle2 } from "lucide-react";

const GettingStarted = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/docs" className="text-muted-foreground hover:text-primary">
              Docs
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Getting Started</span>
          </div>

          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Getting Started with MinBit</h1>
            <p className="text-xl text-muted-foreground">
              Your complete guide to deploying open-source AI tools in minutes.
            </p>
          </div>

          <Separator />

          {/* What is MinBit */}
          <section id="what-is-minbit" className="space-y-4">
            <h2 className="text-3xl font-bold">What is MinBit Portal?</h2>
            <p className="text-muted-foreground leading-relaxed">
              MinBit Portal is a configuration wizard and service catalog that helps you quickly set up 
              self-hosted AI infrastructure. Instead of manually configuring Docker Compose files, 
              environment variables, and service dependencies, MinBit generates production-ready 
              configurations based on your specific use case.
            </p>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Key principle:</strong> MinBit doesn't host your services. It generates the configuration 
                files you need to deploy them on your own infrastructure.
              </AlertDescription>
            </Alert>
          </section>

          <Separator />

          {/* 5-Minute Quickstart */}
          <section id="quickstart" className="space-y-4">
            <h2 className="text-3xl font-bold">5-Minute Quickstart</h2>
            <p className="text-muted-foreground">
              Get a working AI chatbot running in under 5 minutes.
            </p>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      1
                    </span>
                    <span>Choose Your Use Case</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Navigate to the <Link to="/wizard" className="text-primary hover:underline">Configuration Wizard</Link> and 
                    select <strong>"Chatbot"</strong> as your use case. This pre-selects Ollama (LLM runner) and 
                    Open WebUI (chat interface).
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      2
                    </span>
                    <span>Configure Services</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Keep the default settings or customize ports and environment variables. 
                    MinBit automatically detects dependencies and warns about conflicts.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      3
                    </span>
                    <span>Download Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Review your stack in the YAML preview, then click <strong>"Download Stack"</strong>. 
                    You'll get a ZIP file with <code className="bg-muted px-1 py-0.5 rounded">docker-compose.yml</code>, 
                    <code className="bg-muted px-1 py-0.5 rounded">.env</code>, and a README.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      4
                    </span>
                    <span>Deploy Your Stack</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">Extract the ZIP and run:</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
                      docker compose up -d
                    </code>
                  </pre>
                  <p className="text-muted-foreground">
                    Your services will start and be accessible at the ports you configured (default: Ollama on 11434, Open WebUI on 3000).
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertDescription>
                <strong>Prerequisites:</strong> Docker and Docker Compose installed on your machine. 
                See our <Link to="/docs/installation#docker-basics" className="text-primary hover:underline">Docker Installation Guide</Link> if you need help.
              </AlertDescription>
            </Alert>
          </section>

          <Separator />

          {/* Wizard Walkthrough */}
          <section id="wizard-walkthrough" className="space-y-4">
            <h2 className="text-3xl font-bold">Wizard Walkthrough</h2>
            <p className="text-muted-foreground">
              Detailed explanation of each wizard step.
            </p>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Step 1: Welcome</h3>
                <p className="text-muted-foreground">
                  Introduction screen with key stats about the service catalog. Click <strong>"Start Building"</strong> to begin.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Step 2: Use Case Selection</h3>
                <p className="text-muted-foreground">
                  Choose from pre-configured use cases or select <strong>"Custom Stack"</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li><strong>Chatbot:</strong> Ollama + Open WebUI</li>
                  <li><strong>RAG System:</strong> Ollama + Open WebUI + Qdrant + LangFlow</li>
                  <li><strong>Workflow Automation:</strong> n8n + optional Ollama</li>
                  <li><strong>Custom Stack:</strong> Manually select all services</li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Step 3: Service Selection</h3>
                <p className="text-muted-foreground">
                  Browse the service catalog and add/remove services. Features:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Filter by category (LLM Runners, Chat UIs, Workflow Agents, Vector DBs)</li>
                  <li>Search by name or description</li>
                  <li>Automatic dependency detection (e.g., Open WebUI requires Ollama)</li>
                  <li>Port conflict warnings</li>
                  <li>GPU requirement indicators</li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Step 4: Configuration</h3>
                <p className="text-muted-foreground">
                  Configure each selected service:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Set custom ports (host and container)</li>
                  <li>Configure environment variables</li>
                  <li>Enable GPU support (if available)</li>
                  <li>Set resource limits</li>
                </ul>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Form validation prevents you from proceeding if required fields are missing.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Step 5 */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Step 5: Review</h3>
                <p className="text-muted-foreground">
                  Preview your complete stack configuration:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Syntax-highlighted YAML preview of docker-compose.yml</li>
                  <li>View .env and README.md contents</li>
                  <li>Copy-to-clipboard functionality</li>
                  <li>Port conflict warnings</li>
                </ul>
              </div>

              {/* Step 6 */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Step 6: Download</h3>
                <p className="text-muted-foreground">
                  Download your configuration as a ZIP file containing:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li><code className="bg-muted px-1 py-0.5 rounded">docker-compose.yml</code> - Service definitions</li>
                  <li><code className="bg-muted px-1 py-0.5 rounded">.env</code> - Environment variables</li>
                  <li><code className="bg-muted px-1 py-0.5 rounded">README.md</code> - Setup instructions and troubleshooting</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          {/* Key Concepts */}
          <section id="key-concepts" className="space-y-4">
            <h2 className="text-3xl font-bold">Key Concepts</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Individual Docker containers that run specific AI tools (e.g., Ollama for LLM inference, 
                    Open WebUI for chat interface, Qdrant for vector storage).
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stacks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    A collection of services configured to work together. Defined in <code className="bg-muted px-1 py-0.5 rounded">docker-compose.yml</code>.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dependencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Some services require others to function. For example, Open WebUI requires an LLM runner like Ollama. 
                    MinBit automatically detects and warns you about missing dependencies.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Network ports for accessing services. Format: <code className="bg-muted px-1 py-0.5 rounded">host:container</code>. 
                    Example: <code className="bg-muted px-1 py-0.5 rounded">8080:80</code> means access service on your machine at port 8080, 
                    which maps to port 80 inside the container.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* First-Time Troubleshooting */}
          <section id="first-time-issues" className="space-y-4">
            <h2 className="text-3xl font-bold">Common First-Time Issues</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Docker not installed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>Error:</strong> <code className="bg-muted px-1 py-0.5 rounded">docker: command not found</code>
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Solution:</strong> Install Docker Desktop from <a href="https://docker.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">docker.com</a> or 
                    follow our <Link to="/docs/installation#docker-basics" className="text-primary hover:underline">Docker installation guide</Link>.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Port already in use</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>Error:</strong> <code className="bg-muted px-1 py-0.5 rounded">Error starting userland proxy: listen tcp 0.0.0.0:8080: bind: address already in use</code>
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Solution:</strong> Change the host port in your <code className="bg-muted px-1 py-0.5 rounded">.env</code> file or 
                    stop the conflicting service. See <Link to="/docs/troubleshooting#port-conflicts" className="text-primary hover:underline">Port Conflicts</Link>.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service won't start</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>Check logs:</strong>
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
                      docker compose logs [service-name]
                    </code>
                  </pre>
                  <p className="text-muted-foreground">
                    See our <Link to="/docs/troubleshooting" className="text-primary hover:underline">Troubleshooting Guide</Link> for common fixes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Next Steps */}
          <section className="bg-muted/30 border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span>Next Steps</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/docs/services">
                <Button variant="outline" className="w-full justify-start">
                  Explore Service Directory →
                </Button>
              </Link>
              <Link to="/docs/installation">
                <Button variant="outline" className="w-full justify-start">
                  Advanced Installation →
                </Button>
              </Link>
              <Link to="/wizard">
                <Button variant="default" className="w-full justify-start">
                  Try the Wizard →
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline" className="w-full justify-start">
                  Get Professional Help →
                </Button>
              </Link>
            </div>
          </section>

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

export default GettingStarted;
