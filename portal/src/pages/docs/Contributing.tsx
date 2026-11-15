import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Heart, Github, Code, FileText, MessageSquare, Server } from "lucide-react";

const Contributing = () => {
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
            <span className="font-medium">Contributing</span>
          </div>

          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Contributing to MinBit Portal</h1>
            <p className="text-xl text-muted-foreground">
              Help make MinBit Portal better for everyone. Every contribution matters!
            </p>
          </div>

          <Alert>
            <Heart className="h-4 w-4" />
            <AlertDescription>
              <strong>Open Source, Community Driven:</strong> MinBit Portal is built by developers, 
              for developers. Your contributions help thousands of people deploy AI infrastructure more easily.
            </AlertDescription>
          </Alert>

          <Separator />

          {/* Ways to Contribute */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Ways to Contribute</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-primary" />
                    <span>Code</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Submit bug fixes, new features, or improvements to existing functionality.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Documentation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Improve guides, fix typos, add examples, or create tutorials.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-primary" />
                    <span>Add Services</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Add new open-source AI services to the catalog with proper configuration.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span>Community</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Help others on Discord, share your setups, report bugs, or suggest features.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* Code of Conduct */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Code of Conduct</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  We're committed to providing a welcoming and inclusive environment. By participating, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Be respectful and considerate in all interactions</li>
                  <li>Welcome newcomers and help them learn</li>
                  <li>Accept constructive feedback gracefully</li>
                  <li>Focus on what's best for the community</li>
                  <li>Show empathy towards other community members</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Unacceptable behavior includes harassment, discrimination, trolling, or any form of disrespect.
                </p>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Getting Started */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Getting Started</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      1
                    </span>
                    <span>Fork the Repository</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Visit the <a href="https://github.com/minbit-portal/minbit-portal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      GitHub repository
                    </a> and click "Fork" in the top right.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      2
                    </span>
                    <span>Clone Your Fork</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
                      git clone https://github.com/YOUR_USERNAME/minbit-portal.git<br />
                      cd minbit-portal<br />
                      npm install
                    </code>
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      3
                    </span>
                    <span>Create a Branch</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
                      git checkout -b feature/your-feature-name
                    </code>
                  </pre>
                  <p className="text-muted-foreground text-sm">
                    Use descriptive branch names: <code className="bg-muted px-1 py-0.5 rounded">feature/add-service</code>, 
                    <code className="bg-muted px-1 py-0.5 rounded"> fix/port-conflict-bug</code>, etc.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      4
                    </span>
                    <span>Make Your Changes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Write clean, well-commented code. Follow existing patterns and conventions.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                    <li>Test your changes thoroughly</li>
                    <li>Ensure responsive design works on mobile</li>
                    <li>Follow TypeScript best practices</li>
                    <li>Update documentation if needed</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      5
                    </span>
                    <span>Commit and Push</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
                      git add .<br />
                      git commit -m "feat: add new service to catalog"<br />
                      git push origin feature/your-feature-name
                    </code>
                  </pre>
                  <p className="text-muted-foreground text-sm">
                    Use <a href="https://www.conventionalcommits.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      conventional commit messages
                    </a>: <code className="bg-muted px-1 py-0.5 rounded">feat:</code>, 
                    <code className="bg-muted px-1 py-0.5 rounded"> fix:</code>, 
                    <code className="bg-muted px-1 py-0.5 rounded"> docs:</code>, etc.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      6
                    </span>
                    <span>Submit Pull Request</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Go to your fork on GitHub and click "Pull Request". Provide:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                    <li>Clear description of changes</li>
                    <li>Why the change is needed</li>
                    <li>Screenshots (for UI changes)</li>
                    <li>Testing steps</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* Adding Services */}
          <section id="adding-services" className="space-y-4">
            <h2 className="text-3xl font-bold">How to Add a New Service</h2>
            <p className="text-muted-foreground">
              Expanding the service catalog is one of the most valuable contributions!
            </p>

            <Card>
              <CardHeader>
                <CardTitle>Step 1: Choose a Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">
                  Pick an open-source AI tool that's not yet in the catalog. Ensure it:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                  <li>Has an official Docker image</li>
                  <li>Is actively maintained</li>
                  <li>Fits one of our categories (LLM Runners, Chat UIs, Workflow/Agents, Vector DBs)</li>
                  <li>Is well-documented</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Add to services.json</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">
                  Edit <code className="bg-muted px-1 py-0.5 rounded">src/data/services.json</code> and add your service:
                </p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">
{`{
  "id": "your-service-id",
  "name": "Service Name",
  "category": "llm-runners",
  "description": "Brief description",
  "longDescription": "Detailed description",
  "complexity": "beginner",
  "tags": ["cpu-only", "self-hosted"],
  "dockerImage": "org/image-name",
  "dockerImageTag": "latest",
  "ports": [
    {
      "container": 8080,
      "host": 8080,
      "description": "Web UI"
    }
  ],
  "dependencies": [],
  "configOptions": [
    {
      "key": "EXAMPLE_VAR",
      "label": "Example Variable",
      "type": "text",
      "default": "default-value",
      "description": "What this does",
      "required": true
    }
  ],
  "environmentVariables": {
    "EXAMPLE_VAR": "default-value"
  },
  "officialDocs": "https://docs.example.com",
  "githubRepo": "https://github.com/example/repo"
}`}
                  </code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Test Thoroughly</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Use the wizard to generate a stack with your service</li>
                  <li>Deploy using docker compose and verify it works</li>
                  <li>Test dependency detection (if applicable)</li>
                  <li>Verify all config options work correctly</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 4: Document Your Addition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">
                  In your PR description, include:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                  <li>Why this service is valuable</li>
                  <li>Screenshots of the service running</li>
                  <li>Typical use cases</li>
                  <li>Any special requirements (GPU, memory, etc.)</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Reporting Bugs */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Reporting Bugs</h2>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground">
                  Found a bug? Help us fix it by providing detailed information:
                </p>

                <div className="space-y-2">
                  <div className="font-medium">What to Include:</div>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                    <li><strong>Clear title:</strong> "Port conflict not detected when adding duplicate service"</li>
                    <li><strong>Steps to reproduce:</strong> Numbered list of exact steps</li>
                    <li><strong>Expected behavior:</strong> What should happen</li>
                    <li><strong>Actual behavior:</strong> What actually happens</li>
                    <li><strong>Screenshots:</strong> Visual evidence helps!</li>
                    <li><strong>Environment:</strong> Browser, OS, Docker version</li>
                    <li><strong>Error logs:</strong> Console errors or stack traces</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <a
                    href="https://github.com/minbit-portal/minbit-portal/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full">
                      <Github className="mr-2 h-4 w-4" />
                      Report a Bug
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Feature Requests */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Feature Requests</h2>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground">
                  Have an idea for a new feature? We'd love to hear it!
                </p>

                <div className="space-y-2">
                  <div className="font-medium">What Makes a Good Feature Request:</div>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                    <li><strong>Clear problem statement:</strong> What problem does this solve?</li>
                    <li><strong>Proposed solution:</strong> How would you implement it?</li>
                    <li><strong>Use cases:</strong> Who would benefit and why?</li>
                    <li><strong>Alternatives considered:</strong> What other approaches did you think about?</li>
                    <li><strong>Mockups:</strong> Visual examples help (optional)</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <a
                    href="https://github.com/minbit-portal/minbit-portal/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <Github className="mr-2 h-4 w-4" />
                      Request a Feature
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
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

export default Contributing;
