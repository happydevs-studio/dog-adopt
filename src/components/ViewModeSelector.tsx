import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type ViewMode = 'text-only' | 'with-images';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onChange: (value: ViewMode) => void;
}

export const ViewModeSelector = ({ viewMode, onChange }: ViewModeSelectorProps) => (
  <div className="mb-6 p-4 bg-card rounded-lg shadow-soft">
    <Label className="text-base font-semibold mb-3 block">View Mode</Label>
    <RadioGroup value={viewMode} onValueChange={(value) => onChange(value as ViewMode)}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="text-only" id="text-only" />
        <Label htmlFor="text-only" className="cursor-pointer">Text Only</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="with-images" id="with-images" disabled />
        <Label htmlFor="with-images" className="cursor-not-allowed opacity-50">
          With Images <span className="text-xs text-muted-foreground">(Coming Soon)</span>
        </Label>
      </div>
    </RadioGroup>
  </div>
);
