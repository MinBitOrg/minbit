import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Terminal, Server, Zap } from "lucide-react";

const Installation = () => {
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
            <span className="font-medium">Installation & Deployment</span>
          </div>

          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Installation & Deployment</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to deploy MinBit-generated stacks.
            </p>
          </div>

          <Separator />

          {/* Docker Basics */}
          <section id="docker-basics" className="space-y-4">
            <h2 className="text-3xl font-bold">Docker Installation (Beginners)</h2>
            <p className="text-muted-foreground">
              Docker is a platform that lets you run applications in isolated containers. 
              Think of it as lightweight virtual machines that share your computer's resources efficiently.
            </p>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Install Docker Desktop</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Download Docker Desktop for your operating system:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>
                      <a href="https://docs.docker.com/desktop/install/windows-install/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Windows
                      </a> - Requires Windows 10 64-bit or newer
                    </li>
                    <li>
                      <a href="https://docs.docker.com/desktop/install/mac-install/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        macOS
                      </a> - Supports both Intel and Apple Silicon
                    </li>
                    <li>
                      <a href="https://docs.docker.com/desktop/install/linux-install/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Linux
                      </a> - Various distributions supported
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Verify Installation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">Open your terminal and run:</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">docker --version</code>
                  </pre>
                  <p className="text-muted-foreground">
                    You should see something like: <code className="bg-muted px-1 py-0.5 rounded">Docker version 24.0.0, build ...</code>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Verify Docker Compose</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Docker Compose comes bundled with Docker Desktop. Verify it's installed:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">docker compose version</code>
                  </pre>
                  <p className="text-muted-foreground">
                    You should see: <code className="bg-muted px-1 py-0.5 rounded">Docker Compose version v2.x.x</code>
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertDescription>
                <strong>First time using terminal?</strong> On Windows, use PowerShell or Command Prompt. 
                On macOS/Linux, use Terminal. You can usually find it by searching for "terminal" in your system.
              </AlertDescription>
            </Alert>
          </section>

          <Separator />

          {/* Docker Compose Setup */}
          <section id="docker-compose" className="space-y-4">
            <h2 className="text-3xl font-bold">Deploying with Docker Compose</h2>
            <p className="text-muted-foreground">
              The most common deployment method. Works on any machine with Docker installed.
            </p>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Extract Your Stack</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    After downloading your stack from the MinBit wizard, extract the ZIP file:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
                      unzip minbit-stack.zip<br />
                      cd minbit-stack
                    </code>
                  </pre>
                  <p className="text-muted-foreground">
                    You should see three files: <code className="bg-muted px-1 py-0.5 rounded">docker-compose.yml</code>, 
                    <code className="bg-muted px-1 py-0.5 rounded">.env</code>, and <code className="bg-muted px-1 py-0.5 rounded">README.md</code>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Review Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Open <code className="bg-muted px-1 py-0.5 rounded">.env</code> in a text editor and verify:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Ports are not conflicting with existing services</li>
                    <li>Environment variables are set correctly</li>
                    <li>GPU settings match your hardware (if applicable)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Start Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Start all services in detached mode (runs in background):
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">docker compose up -d</code>
                  </pre>
                  <p className="text-muted-foreground">
                    Docker will download images (first time only) and start containers. This may take 5-10 minutes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Step 4: Verify Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">Check that all services are running:</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">docker compose ps</code>
                  </pre>
                  <p className="text-muted-foreground">
                    All services should show <code className="bg-muted px-1 py-0.5 rounded">Up</code> status.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro tip:</strong> View logs in real-time with <code className="bg-muted px-1 py-0.5 rounded">docker compose logs -f</code>. 
                Press Ctrl+C to exit log view.
              </AlertDescription>
            </Alert>
          </section>

          <Separator />

          {/* Management Commands */}
          <section id="management" className="space-y-4">
            <h2 className="text-3xl font-bold">Managing Your Stack</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Common Commands</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="font-medium">Stop all services:</div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm">docker compose down</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Restart a specific service:</div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm">docker compose restart [service-name]</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">View logs for a service:</div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm">docker compose logs [service-name]</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Update services (pull new images):</div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm">
                        docker compose pull<br />
                        docker compose up -d
                      </code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Remove everything (including volumes):</div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm">docker compose down -v</code>
                    </pre>
                    <p className="text-muted-foreground text-sm">
                      ⚠️ This deletes all data! Use with caution.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* Port Mapping */}
          <section id="port-mapping" className="space-y-4">
            <h2 className="text-3xl font-bold">Understanding Port Mapping</h2>
            <p className="text-muted-foreground">
              Port mapping connects ports on your computer (host) to ports inside Docker containers.
            </p>

            <Card>
              <CardHeader>
                <CardTitle>Port Format: host:container</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Example: <code className="bg-muted px-1 py-0.5 rounded">8080:80</code>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><strong>8080</strong> = Port on your computer (host)</li>
                    <li><strong>80</strong> = Port inside the container</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Access the service at: <code className="bg-muted px-1 py-0.5 rounded">http://localhost:8080</code>
                  </p>
                </div>

                <Alert>
                  <AlertDescription>
                    If a port is already in use, you'll see an error. Change the host port (left number) 
                    in your <code className="bg-muted px-1 py-0.5 rounded">.env</code> file to an unused port.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* GPU Setup */}
          <section id="gpu-setup" className="space-y-4">
            <h2 className="text-3xl font-bold">GPU Setup (NVIDIA)</h2>
            <p className="text-muted-foreground">
              Required for LLM runners like Ollama to achieve good performance.
            </p>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>NVIDIA GPU (GTX 1060 or better recommended)</li>
                    <li>Latest NVIDIA drivers installed</li>
                    <li>NVIDIA Container Toolkit installed</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Install NVIDIA Container Toolkit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">Linux:</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
                      distribution=$(. /etc/os-release;echo $ID$VERSION_ID)<br />
                      curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -<br />
                      curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list<br />
                      <br />
                      sudo apt-get update<br />
                      sudo apt-get install -y nvidia-container-toolkit<br />
                      sudo systemctl restart docker
                    </code>
                  </pre>
                  <p className="text-muted-foreground">
                    Windows/macOS: GPU passthrough not fully supported. Consider using WSL2 (Windows) or Linux VM.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verify GPU Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">Test GPU access in Docker:</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
                      docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
                    </code>
                  </pre>
                  <p className="text-muted-foreground">
                    You should see your GPU listed in the output.
                  </p>
                </CardContent>
              </Card>
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

export default Installation;
