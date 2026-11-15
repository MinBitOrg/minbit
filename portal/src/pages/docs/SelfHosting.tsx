import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Server, Github } from "lucide-react";

const SelfHosting = () => {
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
            <span className="font-medium">Self-Hosting MinBit Portal</span>
          </div>

          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Self-Hosting MinBit Portal</h1>
            <p className="text-xl text-muted-foreground">
              Run MinBit Portal on your own infrastructure.
            </p>
          </div>

          <Alert>
            <Server className="h-4 w-4" />
            <AlertDescription>
              <strong>Why self-host?</strong> Run MinBit Portal entirely on your infrastructure 
              for maximum privacy, customization, and control. Perfect for enterprises or teams 
              with specific compliance requirements.
            </AlertDescription>
          </Alert>

          <Separator />

          {/* Prerequisites */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Prerequisites</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Node.js 18+ and npm/yarn installed</li>
                  <li>Git for cloning the repository</li>
                  <li>Basic understanding of React and Vite</li>
                  <li>Web server (nginx, Apache, or similar) for production deployment</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Quick Start */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Quick Start</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      1
                    </span>
                    <span>Clone the Repository</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
                      git clone https://github.com/minbit-portal/minbit-portal.git<br />
                      cd minbit-portal
                    </code>
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      2
                    </span>
                    <span>Install Dependencies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">npm install</code>
                  </pre>
                  <p className="text-muted-foreground text-sm">
                    Or use yarn: <code className="bg-muted px-1 py-0.5 rounded">yarn install</code>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      3
                    </span>
                    <span>Run Development Server</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">npm run dev</code>
                  </pre>
                  <p className="text-muted-foreground">
                    MinBit Portal will be available at <code className="bg-muted px-1 py-0.5 rounded">http://localhost:5173</code>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      4
                    </span>
                    <span>Build for Production</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">npm run build</code>
                  </pre>
                  <p className="text-muted-foreground">
                    Production files will be in the <code className="bg-muted px-1 py-0.5 rounded">dist/</code> directory.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* Docker Deployment */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Docker Deployment</h2>
            <p className="text-muted-foreground">
              The easiest way to self-host MinBit Portal in production.
            </p>

            <Card>
              <CardHeader>
                <CardTitle>Dockerfile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">Create a Dockerfile in the project root:</p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">
{`FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`}
                  </code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>nginx.conf</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">Create nginx.conf for SPA routing:</p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">
{`server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}`}
                  </code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Build and Run</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">
                    docker build -t minbit-portal .<br />
                    docker run -d -p 80:80 --name minbit minbit-portal
                  </code>
                </pre>
                <p className="text-muted-foreground">
                  Access MinBit Portal at <code className="bg-muted px-1 py-0.5 rounded">http://localhost</code>
                </p>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Customization */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Customization</h2>

            <Card>
              <CardHeader>
                <CardTitle>Adding Custom Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Add new services to the catalog by editing <code className="bg-muted px-1 py-0.5 rounded">src/data/services.json</code>:
                </p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">
{`{
  "id": "my-service",
  "name": "My Custom Service",
  "category": "llm-runners",
  "description": "A custom AI service",
  "complexity": "intermediate",
  "tags": ["self-hosted"],
  "dockerImage": "myorg/my-service",
  "dockerImageTag": "latest",
  "ports": [
    {
      "container": 8080,
      "host": 8080,
      "description": "Web UI"
    }
  ],
  "dependencies": [],
  "configOptions": [],
  "environmentVariables": {},
  "officialDocs": "https://docs.example.com",
  "githubRepo": "https://github.com/example/repo"
}`}
                  </code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Customize colors and branding in <code className="bg-muted px-1 py-0.5 rounded">src/index.css</code> and 
                  <code className="bg-muted px-1 py-0.5 rounded"> tailwind.config.ts</code>:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Change primary/accent colors</li>
                  <li>Update logo and favicon</li>
                  <li>Modify typography and spacing</li>
                  <li>Customize dark/light theme palettes</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Scaling */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Scaling Considerations</h2>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">Static Site Hosting</div>
                  <p className="text-muted-foreground text-sm">
                    MinBit Portal is a static React app with no backend. It can be served from any 
                    static hosting provider (Netlify, Vercel, S3 + CloudFront, etc.) with excellent 
                    performance and low cost.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">CDN Integration</div>
                  <p className="text-muted-foreground text-sm">
                    Use a CDN (CloudFlare, Fastly, etc.) to cache static assets globally for 
                    faster load times worldwide.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Multiple Instances</div>
                  <p className="text-muted-foreground text-sm">
                    Since there's no backend state, you can run multiple instances behind a load 
                    balancer for high availability.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Monitoring</div>
                  <p className="text-muted-foreground text-sm">
                    Add analytics (Google Analytics, Plausible, etc.) by modifying 
                    <code className="bg-muted px-1 py-0.5 rounded"> index.html</code> or using environment variables.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Contributing */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Contributing Improvements</h2>
            <p className="text-muted-foreground">
              Help make MinBit Portal better for everyone!
            </p>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Github className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-medium">Submit Pull Requests</div>
                      <p className="text-sm text-muted-foreground">
                        Found a bug? Built a cool feature? Submit a PR on GitHub!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Github className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-medium">Report Issues</div>
                      <p className="text-sm text-muted-foreground">
                        Encountered a problem? Open an issue with details and reproduction steps.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Github className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-medium">Share Your Setup</div>
                      <p className="text-sm text-muted-foreground">
                        Document your self-hosting experience and help others in the community.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <a
                    href="https://github.com/minbit-portal/minbit-portal"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full">
                      <Github className="mr-2 h-4 w-4" />
                      View on GitHub
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

export default SelfHosting;
