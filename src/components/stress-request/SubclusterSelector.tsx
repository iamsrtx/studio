
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts/AppContext";
import type { Subcluster } from "@/lib/types";

interface SubclusterSelectorProps {
  selectedSubclusterId: string | undefined;
  onSubclusterChange: (subclusterId: string) => void;
  disabled?: boolean;
  // facilityType?: string | undefined; // For future filtering if needed
}

export default function SubclusterSelector({ selectedSubclusterId, onSubclusterChange, disabled }: SubclusterSelectorProps) {
  const { subclusters } = useAppContext();
  const availableSubclusters = subclusters;

  return (
    <div className="space-y-2">
      <Label htmlFor="subcluster-select">Subcluster</Label>
      <Select
        value={selectedSubclusterId}
        onValueChange={onSubclusterChange}
        disabled={disabled || availableSubclusters.length === 0}
      >
        <SelectTrigger id="subcluster-select" className="w-full h-10">
          <SelectValue placeholder="Select a subcluster" />
        </SelectTrigger>
        <SelectContent>
          {availableSubclusters.map((subcluster: Subcluster) => (
            <SelectItem key={subcluster.id} value={subcluster.id}>
              {subcluster.name}
            </SelectItem>
          ))}
          {availableSubclusters.length === 0 && <SelectItem value="no-subclusters" disabled>No subclusters available</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
}
