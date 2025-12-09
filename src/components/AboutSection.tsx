import { Heart, Home, Shield, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'Save a Life',
    description: 'Every dog adopted from a rescue means another life saved. Give a deserving dog their second chance.',
  },
  {
    icon: Home,
    title: 'Find Your Match',
    description: 'Our comprehensive profiles help you find a dog that fits your lifestyle, home, and family.',
  },
  {
    icon: Shield,
    title: 'Trusted Rescues',
    description: 'We partner with verified rescue organisations across the UK who prioritise animal welfare.',
  },
  {
    icon: Sparkles,
    title: 'Support Included',
    description: 'Most rescues provide ongoing support and advice to help you and your new companion settle in.',
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            Why Adopt?
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            The Joy of Rescue Dog Adoption
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Adopting a rescue dog is one of the most rewarding experiences. Here's why thousands of families choose adoption.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-background rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Over 100,000 Dogs in UK Rescues Need Homes
            </h3>
            <p className="text-muted-foreground mb-6">
              While puppy farms and irresponsible breeders continue to profit, rescue centres are overflowing with dogs desperate for loving families. 
              By choosing to adopt, you're not just getting a pet — you're making a stand against the cruel puppy trade.
            </p>
            <p className="text-foreground font-medium">
              <span className="text-primary">#AdoptDontShop</span> — Because every dog deserves a second chance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
