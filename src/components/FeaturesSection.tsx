import { Heart, Shield, Search, Users } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      id: 'ethical-nonprofit',
      icon: Heart,
      title: "Ethical & Non-Profit",
      description: "100% non-profit platform promoting responsible dog adoption"
    },
    {
      id: 'quality-rescues',
      icon: Shield,
      title: "Quality Rescues",
      description: "Carefully selected rescue organisations committed to high welfare"
    },
    {
      id: 'easy-to-find',
      icon: Search,
      title: "Easy to Find",
      description: "Advanced filters help you find your perfect companion quickly"
    },
    {
      id: 'support-network',
      icon: Users,
      title: "Support Network",
      description: "Connect with experienced rescues who guide you through adoption"
    }
  ];

  return (
    <section className="py-6 sm:py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="text-center p-3 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <h3 className="font-display text-xs sm:text-base md:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                {feature.title}
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-relaxed hidden sm:block">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
