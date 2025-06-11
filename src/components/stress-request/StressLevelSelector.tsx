
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FacilityFunction, StressLevel, StressLevelOption } from "@/lib/types"; // Changed FacilityType to FacilityFunction
import { STRESS_LEVELS_MAP } from "@/lib/constants";

interface StressLevelSelectorProps {
  facilityFunction: FacilityFunction | undefined; // Changed from facilityType
  selectedStressLevel: StressLevel | undefined;
  onStressLevelChange: (stressLevel: StressLevel) => void;
  disabled?: boolean;
}

export default function StressLevelSelector({ facilityFunction, selectedStressLevel, onStressLevelChange, disabled }: StressLevelSelectorProps) {
  const options: StressLevelOption[] = facilityFunction ? STRESS_LEVELS_MAP[facilityFunction] || [] : []; // Added fallback for undefined facilityFunction in map

  return (
    <div className="space-y-2">
      <Label htmlFor="stress-level-select">Stress Level</Label>
      <Select
        value={selectedStressLevel}
        onValueChange={(value) => onStressLevelChange(value as StressLevel)}
        disabled={disabled || !facilityFunction || options.length === 0}
      >
        <SelectTrigger id="stress-level-select" className="w-full h-10">
          <SelectValue placeholder={facilityFunction ? "Select stress level" : "Select facility & function first"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
           {options.length === 0 && facilityFunction && <SelectItem value="no-options" disabled>No stress levels for this function</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
}
