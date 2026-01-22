import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const PrivacyPolicy = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy | dogadopt.co.uk - UK Dog Adoption Platform"
        description="Privacy policy for dogadopt.co.uk. Learn how we collect, use, and protect your data on our non-profit dog adoption platform."
        canonicalUrl="https://dogadopt.co.uk/privacy"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="font-display text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: 31 December 2024</p>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Our Commitment</h2>
            <p className="text-muted-foreground">
              dogadopt.co.uk is a 100% non-profit platform connecting rescue dogs with loving families. 
              We are committed to protecting your privacy and do not sell, rent, or share your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">What We Collect</h2>
            <p className="text-muted-foreground mb-2">We collect minimal information to provide our service:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Email address (if you create an account)</li>
              <li>Basic usage data (pages visited, browser type)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">How We Use It</h2>
            <p className="text-muted-foreground">
              We use your information to provide and improve our service, respond to inquiries, and maintain platform security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
            <p className="text-muted-foreground">
              Your data is securely stored using Supabase, which complies with GDPR and UK data protection regulations. 
              We use industry-standard security measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
            <p className="text-muted-foreground">
              Under UK GDPR, you have the right to access, correct, or delete your personal data. 
              Contact us at{' '}
              <a href="mailto:info@dogadopt.co.uk" className="text-primary hover:underline">
                info@dogadopt.co.uk
              </a>{' '}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Cookies</h2>
            <p className="text-muted-foreground">
              We use essential cookies to improve your browsing experience. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground">
              Questions about privacy? Email us at{' '}
              <a href="mailto:info@dogadopt.co.uk" className="text-primary hover:underline">
                info@dogadopt.co.uk
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
};

export default PrivacyPolicy;
