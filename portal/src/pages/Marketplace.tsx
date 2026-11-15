import { useState, useMemo } from "react";
import { getAllServices } from "@/lib/services";
import { ServiceCard } from "@/components/ServiceCard";
import { SelectionSummary } from "@/components/marketplace/SelectionSummary";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ServiceCategory } from "@/types/service";
import { CATEGORY_LABELS } from "@/data/constants";
import { Search } from "lucide-react";

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">("all");
  
  const allServices = getAllServices();

  const filteredServices = useMemo(() => {
    return allServices.filter((service) => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [allServices, searchQuery, selectedCategory]);

  return (
    <>
      <div className="container py-8 md:py-12 pb-32">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-mono">
            Service Marketplace
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse open-source AI tools across multiple categories. Each service is battle-tested, 
            community-driven, and ready to deploy.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search services, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search services by name, tag, or description"
          />
        </div>

        {/* Category Filter */}
        <div className="flex justify-center">
          <ToggleGroup
            type="single"
            value={selectedCategory}
            onValueChange={(value) => value && setSelectedCategory(value as ServiceCategory | "all")}
            className="flex-wrap justify-center"
            aria-label="Filter services by category"
          >
            {(Object.keys(CATEGORY_LABELS) as Array<ServiceCategory | "all">).map((category) => (
              <ToggleGroupItem 
                key={category} 
                value={category} 
                variant="outline"
                className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {CATEGORY_LABELS[category]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Results Count */}
        <div className="text-center text-sm text-muted-foreground" aria-live="polite">
          Showing {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"}
        </div>

        {/* Service Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Service list">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services found matching your criteria.</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
        </div>
      </div>
      
      <SelectionSummary />
    </>
  );
};

export default Marketplace;
