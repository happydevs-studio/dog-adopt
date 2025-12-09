import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="rescues" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-display text-xl font-semibold">
                dogadopt<span className="text-primary">.co.uk</span>
              </span>
            </a>
            <p className="text-background/70 max-w-md">
              Connecting rescue dogs with loving families across the UK. 
              Our mission is to promote adoption and help every dog find their forever home.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#dogs" className="hover:text-primary transition-colors">Find a Dog</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">Why Adopt?</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Rescue Partners</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Partner Rescues</h4>
            <ul className="space-y-2 text-background/70">
              <li>Battersea Dogs Home</li>
              <li>Dogs Trust</li>
              <li>RSPCA</li>
              <li>Blue Cross</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} dogadopt.co.uk. Made with <Heart className="w-4 h-4 inline text-primary" fill="currentColor" /> for rescue dogs.
          </p>
          <p className="text-background/50 text-sm">
            <span className="text-primary">#AdoptDontShop</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
