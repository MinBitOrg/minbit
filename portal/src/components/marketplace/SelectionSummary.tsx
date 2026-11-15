import { useMarketplaceStore } from "@/stores/marketplaceStore";
import { getServiceById } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const SelectionSummary = () => {
  const { selectedServices, removeService, clearSelection } = useMarketplaceStore();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(selectedServices.length > 0);
  }, [selectedServices.length]);

  if (!isVisible) return null;

  const handleConfigureStack = () => {
    const servicesParam = selectedServices.join(',');
    navigate(`/wizard?services=${servicesParam}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm shadow-lg animate-in slide-in-from-bottom-5">
      <div className="container py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Selected Services Display */}
          <div className="flex-1 w-full md:w-auto">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'} selected:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map((serviceId) => {
                const service = getServiceById(serviceId);
                if (!service) return null;
                
                return (
                  <Badge 
                    key={serviceId} 
                    variant="secondary"
                    className="pl-3 pr-2 py-1.5 text-sm bg-primary/10 text-primary border-primary/20"
                  >
                    {service.name}
                    <button
                      onClick={() => removeService(serviceId)}
                      className="ml-2 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${service.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={clearSelection}
              className="flex-1 md:flex-none"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button
              onClick={handleConfigureStack}
              className="flex-1 md:flex-none"
            >
              Configure Stack
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
