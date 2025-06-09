
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts/AppContext";
import type { Route } from "@/lib/types";

interface RouteSelectorProps {
  selectedRouteId: string | undefined;
  onRouteChange: (routeId: string) => void;
  disabled?: boolean;
  // facilityType?: string | undefined; // For future filtering if needed
}

export default function RouteSelector({ selectedRouteId, onRouteChange, disabled }: RouteSelectorProps) {
  const { routes } = useAppContext();
  const availableRoutes = routes; 

  return (
    <div className="space-y-2">
      <Label htmlFor="route-select">Route</Label>
      <Select
        value={selectedRouteId}
        onValueChange={onRouteChange}
        disabled={disabled || availableRoutes.length === 0}
      >
        <SelectTrigger id="route-select" className="w-full h-10">
          <SelectValue placeholder="Select a route" />
        </SelectTrigger>
        <SelectContent>
          {availableRoutes.map((route: Route) => (
            <SelectItem key={route.id} value={route.id}>
              {route.name}
            </SelectItem>
          ))}
          {availableRoutes.length === 0 && <SelectItem value="no-routes" disabled>No routes available</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
}
