import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

export const RescuesInfoBox = () => {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Can't find what you're looking for?</span>{' '}
        Check out our{' '}
        <Link to="/rescues" className="text-primary hover:underline font-medium">
          rescues page
        </Link>{' '}
        for a more complete list of nearby rescue centres.
      </p>
    </div>
  );
};
