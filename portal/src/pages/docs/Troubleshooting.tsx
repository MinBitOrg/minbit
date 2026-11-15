import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertCircle } from "lucide-react";

const Troubleshooting = () => {
  const issues = [
    {
      problem: "Service won't start",
      symptoms: [
        "Container exits immediately after starting",
        "Status shows 'Exited (1)' or similar error code",
        "Service not visible in docker compose ps",
      ],
      solutions: [
        {
          step: "Check logs",
          command: "docker compose logs [service-name]",
          description: "Look for error messages in the service logs",
        },
        {
          step: "Verify configuration",
          description: "Check .env file for typos or missing required variables",
        },
        {
          step: "Check disk space",
          command: "df -h",
          description: "Ensure you have sufficient disk space (at least 10GB free)",
        },
        {
          step: "Restart Docker",
          command: "sudo systemctl restart docker",
          description: "Sometimes Docker daemon needs a restart",
        },
      ],
    },
    {
      problem: "Port already in use",
      symptoms: [
        "Error: bind: address already in use",
        "Service fails to start with port conflict",
      ],
      solutions: [
        {
          step: "Identify process using port",
          command: "lsof -i :PORT_NUMBER",
          description: "Find what's using the port (replace PORT_NUMBER with actual port)",
        },
        {
          step: "Change host port",
          description: "Edit .env file and change the host port (left number in port:port)",
        },
        {
          step: "Stop conflicting service",
          description: "If another service is using the port, stop it first",
        },
      ],
    },
    {
      problem: "Out of memory errors",
      symptoms: [
        "Container killed unexpectedly",
        "OOM (Out of Memory) in logs",
        "System becomes unresponsive",
      ],
      solutions: [
        {
          step: "Check system resources",
          command: "docker stats",
          description: "Monitor memory usage of containers",
        },
        {
          step: "Increase Docker memory limit",
          description: "In Docker Desktop: Settings → Resources → Memory (increase to at least 8GB for LLM runners)",
        },
        {
          step: "Use smaller models",
          description: "For Ollama: Use 7B models instead of 13B/70B if memory is limited",
        },
        {
          step: "Close other applications",
          description: "Free up system memory by closing unnecessary programs",
        },
      ],
    },
    {
      problem: "Network connectivity issues",
      symptoms: [
        "Services can't communicate with each other",
        "Cannot access service from browser",
        "Connection refused errors",
      ],
      solutions: [
        {
          step: "Check service is running",
          command: "docker compose ps",
          description: "Ensure service shows 'Up' status",
        },
        {
          step: "Verify port mapping",
          description: "Check docker-compose.yml for correct port configuration",
        },
        {
          step: "Check firewall",
          description: "Ensure firewall isn't blocking Docker ports",
        },
        {
          step: "Restart Docker network",
          command: "docker compose down && docker compose up -d",
          description: "Recreate network stack",
        },
      ],
    },
    {
      problem: "GPU not detected",
      symptoms: [
        "NVIDIA GPU not visible in container",
        "Ollama running on CPU instead of GPU",
        "Slow inference times",
      ],
      solutions: [
        {
          step: "Verify NVIDIA drivers",
          command: "nvidia-smi",
          description: "Check if GPU is visible on host system",
        },
        {
          step: "Install NVIDIA Container Toolkit",
          description: "See GPU Setup section in Installation docs",
        },
        {
          step: "Check docker-compose.yml",
          description: "Ensure service has 'deploy.resources.reservations.devices' configured for GPU",
        },
        {
          step: "Restart Docker daemon",
          command: "sudo systemctl restart docker",
          description: "Apply GPU configuration changes",
        },
      ],
    },
    {
      problem: "Permission denied errors",
      symptoms: [
        "Cannot write to volume",
        "Permission denied when accessing files",
        "Operation not permitted errors",
      ],
      solutions: [
        {
          step: "Fix volume permissions",
          command: "sudo chown -R $USER:$USER ./data",
          description: "Change ownership of data directories",
        },
        {
          step: "Run without sudo",
          command: "sudo usermod -aG docker $USER",
          description: "Add user to docker group (logout required after)",
        },
        {
          step: "Check SELinux",
          description: "On RHEL/CentOS: Temporarily disable SELinux to test (setenforce 0)",
        },
      ],
    },
    {
      problem: "Slow download speeds",
      symptoms: [
        "Docker image pulls are slow",
        "Model downloads in Ollama timeout",
        "Services take hours to initialize",
      ],
      solutions: [
        {
          step: "Use Docker mirror",
          description: "Configure Docker to use a registry mirror closer to your location",
        },
        {
          step: "Check network connection",
          description: "Ensure stable internet connection with good bandwidth",
        },
        {
          step: "Download during off-peak",
          description: "Try downloading large models during off-peak hours",
        },
        {
          step: "Use lighter models",
          description: "Start with smaller models (7B instead of 13B) to reduce download time",
        },
      ],
    },
    {
      problem: "Container keeps restarting",
      symptoms: [
        "Service restarts every few seconds",
        "Status shows 'Restarting'",
        "Logs show repeated startup attempts",
      ],
      solutions: [
        {
          step: "Check logs for errors",
          command: "docker compose logs [service-name]",
          description: "Identify the root cause from error messages",
        },
        {
          step: "Remove restart policy temporarily",
          description: "Comment out 'restart: unless-stopped' in docker-compose.yml to see full error",
        },
        {
          step: "Verify dependencies",
          description: "Ensure dependent services (e.g., database) are running first",
        },
        {
          step: "Check configuration",
          description: "Review environment variables and ensure all required values are set",
        },
      ],
    },
  ];

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
            <span className="font-medium">Troubleshooting</span>
          </div>

          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Troubleshooting Guide</h1>
            <p className="text-xl text-muted-foreground">
              Common issues and how to fix them quickly.
            </p>
          </div>

          <Separator />

          {/* General Debugging */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">General Debugging Steps</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">1. Check service status:</div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">docker compose ps</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">2. View logs:</div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">docker compose logs -f [service-name]</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">3. Check resource usage:</div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">docker stats</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">4. Restart services:</div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">docker compose restart [service-name]</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">5. Recreate from scratch:</div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
                      docker compose down<br />
                      docker compose up -d
                    </code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Specific Issues */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">Common Issues</h2>
            {issues.map((issue, index) => (
              <Card key={index} id={issue.problem.toLowerCase().replace(/\s+/g, "-")}>
                <CardHeader>
                  <CardTitle className="flex items-start space-x-3">
                    <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                    <span>{issue.problem}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Symptoms */}
                  <div>
                    <div className="font-medium mb-2">Symptoms:</div>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {issue.symptoms.map((symptom, i) => (
                        <li key={i}>{symptom}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Solutions */}
                  <div>
                    <div className="font-medium mb-2">Solutions:</div>
                    <div className="space-y-3">
                      {issue.solutions.map((solution, i) => (
                        <div key={i} className="pl-4 border-l-2 border-primary/30">
                          <div className="font-medium text-sm">{solution.step}</div>
                          {solution.command && (
                            <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
                              <code className="text-xs">{solution.command}</code>
                            </pre>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {solution.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <Separator />

          {/* Getting Help */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Still Need Help?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/support">
                <Card className="h-full hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle>Professional Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Get expert help with paid consulting tickets. Starting at €50.
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <a
                href="https://discord.gg/minbit"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="h-full hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle>Community Discord</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Ask questions and get help from the MinBit community.
                    </p>
                  </CardContent>
                </Card>
              </a>
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

export default Troubleshooting;
