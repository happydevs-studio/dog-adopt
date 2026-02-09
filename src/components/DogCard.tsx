import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin } from 'lucide-react';
import type { Dog } from '@/types/dog';
import { DogBadges } from './DogBadges';
import { DogCompatibilityBadges } from './DogCompatibilityBadges';
import { formatStatus, getStatusVariant, getDogProfileUrl, formatRescueDate } from './DogCard.helpers';
import { useState } from 'react';
import ConfettiCelebration from './ConfettiCelebration';

interface DogCardProps {
  dog: Dog;
  viewMode?: 'text-only' | 'with-images';
  showDistance?: boolean;
}

const DogCard = ({ dog, viewMode = 'text-only', showDistance = false }: DogCardProps) => {
  const showImage = viewMode === 'with-images';
  const displayAge = dog.computedAge || dog.age;
  const profileUrl = getDogProfileUrl(dog.profileUrl, dog.name);
  const isProfileLinkEnabled = !!profileUrl;
  const rescueDate = formatRescueDate(dog.rescueSinceDate);
  const [showConfetti, setShowConfetti] = useState(false);
  const [heartBeat, setHeartBeat] = useState(false);

  return (
    <article className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-2 border border-border/50">
      <ConfettiCelebration trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      {showImage && (
        <div className="relative aspect-square overflow-hidden">
          <img
            src={dog.image}
            alt={`${dog.name} - ${dog.breed} available for adoption`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:animate-wiggle"
          />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <Badge variant={getStatusVariant(dog.status)}>{formatStatus(dog.status)}</Badge>
            <Badge variant="warm">{displayAge}</Badge>
            <Badge variant="secondary">{dog.size}</Badge>
          </div>
          <button 
            className={`absolute top-3 right-3 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-soft group/heart ${heartBeat ? 'animate-heart-beat' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setHeartBeat(true);
              setTimeout(() => {
                setHeartBeat(false);
              }, 300);
            }}
          >
            <Heart className="w-5 h-5 group-hover/heart:fill-current transition-all" />
          </button>
        </div>
      )}

      <div className="p-6 space-y-4">
        {!showImage && (
          <DogBadges 
            status={dog.status}
            age={displayAge}
            size={dog.size}
            showDistance={showDistance}
            distance={dog.distance}
          />
        )}
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">{dog.name}</h3>
          <p className="text-muted-foreground">{dog.breed}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{dog.location}</span>
          <span className="text-border">•</span>
          <span>{dog.rescue}</span>
        </div>

        {rescueDate && (
          <div className="text-xs text-muted-foreground">
            {rescueDate}
          </div>
        )}

        <DogCompatibilityBadges dog={dog} />

        <Button 
          variant="default" 
          className="w-full group-hover:bg-primary group-hover:scale-105 transition-all"
          asChild={isProfileLinkEnabled}
          disabled={!isProfileLinkEnabled}
          onClick={() => {
            if (isProfileLinkEnabled) {
              setShowConfetti(true);
            }
          }}
        >
          {isProfileLinkEnabled ? (
            <a 
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Profile
            </a>
          ) : (
            <span>View Profile</span>
          )}
        </Button>
      </div>
    </article>
  );
};

export default DogCard;
