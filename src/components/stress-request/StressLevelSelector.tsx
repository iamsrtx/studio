'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FacilityType, StressLevel, StressLevelOption } from "@/lib/types";
import { STRESS_LEVELS_MAP } from "@/lib/constants";

interface StressLevelSelectorProps {
  facilityType: FacilityType | undefined;
  selectedStressLevel: StressLevel | undefined;
  onStressLevelChange: (stressLevel: StressLevel) => void;
  disabled?: boolean;
}

export default function StressLevelSelector({ facilityType, selectedStressLevel, onStressLevelChange, disabled }: StressLevelSelectorProps) {
  const options: StressLevelOption[] = facilityType ? STRESS_LEVELS_MAP[facilityType] : [];

  return (
    <div className="space-y-2">
      <Label htmlFor="stress-level-select">Stress Level</Label>
      <Select
        value={selectedStressLevel}
        onValueChange={(value) => onStressLevelChange(value as StressLevel)}
        disabled={disabled || !facilityType || options.length === 0}
      >
        <SelectTrigger id="stress-level-select" className="w-full h-10">
          <SelectValue placeholder={facilityType ? "Select stress level" : "Select facility first"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
