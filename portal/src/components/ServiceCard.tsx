import { Service } from "@/types/service";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Check, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useMarketplaceStore } from "@/stores/marketplaceStore";
import { CATEGORY_LABELS_SINGULAR, COMPLEXITY_COLORS } from "@/data/constants";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const { toggleService, isSelected } = useMarketplaceStore();
  const selected = isSelected(service.id);

  return (
    <Card 
      className={cn(
        "h-full flex flex-col transition-all duration-200",
        selected 
          ? "border-primary/60 bg-primary/5 shadow-md" 
          : "hover:border-primary/30"
      )}
      role="listitem"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {CATEGORY_LABELS_SINGULAR[service.category]}
          </Badge>
          <Badge variant="outline" className={cn("text-xs border", COMPLEXITY_COLORS[service.complexity])}>
            {service.complexity}
          </Badge>
        </div>
        <CardTitle className="text-xl">{service.name}</CardTitle>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          {service.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to={`/marketplace/${service.id}`}>
              View Details
            </Link>
          </Button>
          <Button 
            size="sm" 
            onClick={() => toggleService(service.id)}
            aria-label={`${selected ? 'Remove' : 'Add'} ${service.name} ${selected ? 'from' : 'to'} stack`}
            aria-pressed={selected}
            className={cn(
              "flex-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
              selected && "bg-primary text-primary-foreground"
            )}
          >
            {selected ? (
              <>
                <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                Add to Stack
              </>
            )}
          </Button>
        </div>
        <div className="flex gap-2 w-full justify-center">
          <Button variant="ghost" size="sm" asChild>
            <a 
              href={service.githubRepo} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={`${service.name} GitHub repository`}
            >
              <Github className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a 
              href={service.officialDocs} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={`${service.name} documentation`}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
