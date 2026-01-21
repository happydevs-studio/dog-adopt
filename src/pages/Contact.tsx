import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Heart } from 'lucide-react';
import { useEffect } from 'react';

const Contact = () => {
  useEffect(() => {
    document.title = 'Contact Us | dogadopt.co.uk - Get in Touch';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Contact dogadopt.co.uk for questions about our dog adoption platform, rescue listings, or website support. Email: info@dogadopt.co.uk');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display text-4xl font-bold mb-8">Contact Us</h1>
        
        <div className="space-y-8">
          <section>
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Email</h2>
                  <p className="text-muted-foreground mb-3">
                    For all inquiries, please email us at:
                  </p>
                  <a 
                    href="mailto:info@dogadopt.co.uk" 
                    className="text-xl text-primary hover:underline font-medium"
                  >
                    info@dogadopt.co.uk
                  </a>
                </div>
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-muted-foreground text-sm">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <Heart className="w-5 h-5 text-primary mt-1" />
              <h2 className="text-xl font-semibold">Important Note</h2>
            </div>
            <p className="text-muted-foreground">
              <strong>dogadopt.co.uk does not handle adoptions directly.</strong> We're a platform connecting 
              potential adopters with rescue organizations. To adopt a specific dog, please contact the rescue 
              organization listed on that dog's profile.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What We Can Help With</h2>
            <div className="grid gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2">General Questions</h3>
                <p className="text-muted-foreground text-sm">
                  Platform information, how to use the site, partnership opportunities
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2">For Rescue Organizations</h3>
                <p className="text-muted-foreground text-sm">
                  Listing your rescue, updating information, technical support
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Website Issues</h3>
                <p className="text-muted-foreground text-sm">
                  Bug reports, technical difficulties, suggestions
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">About dogadopt.co.uk</h2>
            <p className="text-muted-foreground mb-3">
              We're a 100% non-profit platform dedicated to promoting dog adoption over purchasing. 
              Our goal is to help every rescue dog in the UK find their forever home.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-primary">#AdoptDontShop</strong>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
