import { Button } from '@/components/ui/button';
import { Heart, Search } from 'lucide-react';
import heroImage from '@/assets/hero-dog.jpg';
import { useDogs } from '@/hooks/useDogs';
import { useRescues } from '@/hooks/useRescues';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { data: dogs = [] } = useDogs();
  const { data: rescues = [] } = useRescues();
  const availableDogs = dogs.filter(dog => dog.status === 'available');
  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[700px] gradient-hero overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" fill="currentColor" />
              <span className="text-xs sm:text-sm font-medium text-primary">Adopt Don't Shop</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Find Your Perfect
              <span className="text-primary block">Rescue Companion</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Discover loving rescue dogs from quality organisations across the UK. 
              <span className="block mt-2 font-medium text-foreground">100% non-profit</span>
              <span className="block mt-1">Every adoption saves a life and creates a forever bond.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button variant="hero" size="xl" asChild>
                <a href="#dogs">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  Browse Available Dogs
                </a>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/about">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Why Adopt?
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-border">
              <div className="text-center sm:text-left">
                <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">{availableDogs.length.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Dogs Available (from {rescues.length} {rescues.length === 1 ? 'rescue' : 'rescues'} so far!)</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">{rescues.length.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Quality Rescues</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">100%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Non-Profit</p>
              </div>
            </div>
          </div>

          <div className="relative lg:h-[500px] h-[300px] sm:h-[400px] animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-primary/20 rounded-2xl sm:rounded-3xl transform rotate-3" />
            <img
              src={heroImage}
              alt="Happy golden retriever looking for a home"
              className="relative w-full h-full object-cover rounded-2xl sm:rounded-3xl shadow-hover"
            />
            <div className="absolute -bottom-3 sm:-bottom-4 -left-3 sm:-left-4 bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-card animate-float max-w-[200px] sm:max-w-none">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-accent" fill="currentColor" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground text-sm sm:text-base">Adopt Today</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Give a dog a second chance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
