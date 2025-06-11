
'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import type { FacilityFunction } from "@/lib/types"; // Changed FacilityType to FacilityFunction

interface ReasonSuggestionProps {
  reason: string;
  onReasonChange: (reason: string) => void;
  facilityFunction: FacilityFunction | undefined; // Changed from facilityType
  disabled?: boolean;
}

export default function ReasonSuggestion({ reason, onReasonChange, facilityFunction, disabled }: ReasonSuggestionProps) {
  const { fetchAiReason, isLoadingAiReason } = useAppContext();

  const handleSuggestReason = async () => {
    if (!facilityFunction) return;
    const suggestedReason = await fetchAiReason(facilityFunction);
    onReasonChange(suggestedReason);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="stress-reason">Stress Reason (Optional)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSuggestReason}
          disabled={disabled || isLoadingAiReason || !facilityFunction}
          className="text-xs"
        >
          {isLoadingAiReason ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-3 w-3" />
          )}
          Suggest Reason
        </Button>
      </div>
      <Textarea
        id="stress-reason"
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        placeholder="e.g., High volume, Manpower shortage, System outage"
        rows={3}
        disabled={disabled}
        className="h-auto"
      />
    </div>
  );
}
