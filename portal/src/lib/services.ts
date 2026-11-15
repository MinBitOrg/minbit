import { Service, ServiceCategory } from "@/types/service";
import servicesData from "@/data/services.json";

export const getAllServices = (): Service[] => {
  return servicesData as Service[];
};

export const getServiceById = (id: string): Service | undefined => {
  return getAllServices().find((service) => service.id === id);
};

export const getServicesByCategory = (category: ServiceCategory): Service[] => {
  return getAllServices().filter((service) => service.category === category);
};

export const getPopularServices = (): Service[] => {
  return getAllServices().filter((service) => service.popular === true);
};

export const getRecommendedServices = (): Service[] => {
  return getAllServices().filter((service) => service.recommended === true);
};

export const searchServices = (query: string): Service[] => {
  const lowerQuery = query.toLowerCase();
  return getAllServices().filter(
    (service) =>
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description.toLowerCase().includes(lowerQuery)
  );
};
