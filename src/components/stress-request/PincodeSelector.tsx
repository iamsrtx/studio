
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PincodeSelectorProps {
  selectedPincode: string | undefined;
  onPincodeChange: (pincode: string | undefined) => void; // Allow undefined for clearing
  availablePincodes: string[];
  disabled?: boolean;
}

export default function PincodeSelector({ selectedPincode, onPincodeChange, availablePincodes, disabled }: PincodeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="pincode-select">Pincode</Label>
      <Select
        value={selectedPincode ?? ''} // Handle undefined for Select value
        onValueChange={(value) => onPincodeChange(value === '' ? undefined : value)}
        disabled={disabled || availablePincodes.length === 0}
      >
        <SelectTrigger id="pincode-select" className="w-full h-10">
          <SelectValue placeholder={availablePincodes.length > 0 ? "Select a pincode" : "No pincodes available"} />
        </SelectTrigger>
        <SelectContent>
          {availablePincodes.length > 0 ? (
            availablePincodes.map((pincode: string) => (
              <SelectItem key={pincode} value={pincode}>
                {pincode}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-pincodes" disabled>No pincodes available for this facility</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
