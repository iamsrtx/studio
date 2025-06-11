
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts/AppContext";
import type { Facility } from "@/lib/types";

interface FacilitySelectorProps {
  selectedFacilityId: string | undefined;
  onFacilityChange: (facilityId: string) => void;
  disabled?: boolean;
}

export default function FacilitySelector({ selectedFacilityId, onFacilityChange, disabled }: FacilitySelectorProps) {
  const { facilities } = useAppContext();

  return (
    <div className="space-y-2">
      <Label htmlFor="facility-select">Facility</Label>
      <Select
        value={selectedFacilityId}
        onValueChange={onFacilityChange}
        disabled={disabled || facilities.length === 0}
      >
        <SelectTrigger id="facility-select" className="w-full h-10">
          <SelectValue placeholder="Select a facility" />
        </SelectTrigger>
        <SelectContent>
          {facilities.map((facility: Facility) => (
            <SelectItem key={facility.id} value={facility.id}>
              {facility.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
