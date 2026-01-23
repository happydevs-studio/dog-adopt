import { Heart, Shield, Search, Users } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Heart,
      title: "Ethical & Non-Profit",
      description: "100% non-profit platform promoting responsible dog adoption"
    },
    {
      icon: Shield,
      title: "Quality Rescues",
      description: "Carefully selected rescue organisations committed to high welfare"
    },
    {
      icon: Search,
      title: "Easy to Find",
      description: "Advanced filters help you find your perfect companion quickly"
    },
    {
      icon: Users,
      title: "Support Network",
      description: "Connect with experienced rescues who guide you through adoption"
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-5 sm:p-6 rounded-2xl bg-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
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
