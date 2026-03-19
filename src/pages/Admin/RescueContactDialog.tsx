import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, Mail } from 'lucide-react';
import type { Rescue } from '@/hooks/useRescues';

interface RescueContactDialogProps {
  open: boolean;
  rescue: Rescue | null;
  onOpenChange: (open: boolean) => void;
}

function buildSubject(): string {
  return 'Partnership Request – dogadopt.co.uk | Free Dog Adoption Portal';
}

function buildLetter(rescue: Rescue): string {
  const rescueName = rescue.name;

  return `Dear ${rescueName} Team,

My name is [Your Name], and I run dogadopt.co.uk, a 100% free, non-profit website dedicated to helping people across the UK find and adopt rescue dogs.

Our platform is built on a simple mission: to create a single, easy-to-use portal where potential adopters can discover rescue dogs from reputable organisations across the country — driving more traffic and visibility to rescues like yours, at no cost and for no commercial gain whatsoever.

WHY WE'RE GETTING IN TOUCH

We would love to include ${rescueName} on our platform. We would only ever use publicly available, non-copyrightable information such as:

  • Your organisation's name and region
  • Your contact details (phone, email, website)
  • General factual information about available dogs (breed, age, brief description)

We would never reproduce copyrighted text, photography, or other protected materials without your explicit written permission.

WHAT YOU GET

  ✓ A completely free listing on dogadopt.co.uk
  ✓ Increased visibility to potential adopters across the UK
  ✓ Direct links back to your own website so adopters contact you directly
  ✓ No fees, no catches — we are purely here to help more dogs find loving homes

OUR PROMISE

dogadopt.co.uk is entirely non-commercial. We do not charge for listings, take any commission or referral fees, display paid advertising, or make any profit of any kind. We exist solely to promote the wonderful work that rescue organisations like yours do every single day.

If you are happy for us to include ${rescueName} and your available dogs on our platform, or if you have any questions at all, please reply to this email or contact us at info@dogadopt.co.uk.

Thank you so much for the incredible work you do for rescue dogs across the UK.

With warm regards,

dogadopt.co.uk
info@dogadopt.co.uk
https://dogadopt.co.uk
#AdoptDontShop`;
}

export function RescueContactDialog({ open, rescue, onOpenChange }: RescueContactDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!rescue) return null;

  const subject = buildSubject();
  const letter = buildLetter(rescue);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Letter copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Please select and copy the text manually.', variant: 'destructive' });
    }
  };

  const handleOpenEmail = () => {
    if (!rescue.email) {
      toast({ title: 'No email address', description: 'This rescue has no email address on record. Copy the letter and send it manually.', variant: 'destructive' });
      return;
    }
    const mailtoUrl = `mailto:${encodeURIComponent(rescue.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(letter)}`;
    window.open(mailtoUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Draft Partnership Letter — {rescue.name}</DialogTitle>
          <DialogDescription>
            Review and customise this draft letter before sending it to the rescue organisation.
            Replace <span className="font-semibold text-foreground">[Your Name]</span> with your name before sending.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Subject</p>
            <p className="text-sm bg-muted rounded-md px-3 py-2 font-medium">{subject}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Body</p>
            <Textarea
              readOnly
              value={letter}
              aria-label="Partnership letter body"
              className="min-h-[360px] text-sm font-mono resize-y"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Close
            </Button>
            <Button type="button" variant="outline" onClick={handleCopy} className="w-full sm:w-auto">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Letter'}
            </Button>
            <Button type="button" onClick={handleOpenEmail} className="w-full sm:w-auto">
              <Mail className="w-4 h-4 mr-2" />
              Open in Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
