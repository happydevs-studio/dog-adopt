import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const TermsOfService = () => {
  return (
    <>
      <SEO 
        title="Terms of Service | dogadopt.co.uk - UK Dog Adoption Platform"
        description="Terms of service for dogadopt.co.uk. Understand your rights and responsibilities when using our dog adoption platform."
        canonicalUrl="https://dogadopt.co.uk/terms"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="font-display text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last Updated: 31 December 2024</p>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Acceptance</h2>
            <p className="text-muted-foreground">
              By using dogadopt.co.uk, you agree to these terms. We're a 100% non-profit platform connecting rescue dogs 
              with loving families across the UK.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Our Service</h2>
            <p className="text-muted-foreground">
              We provide a platform to browse rescue dogs and connect with rescue organizations. 
              We do not handle adoptions directly - all applications go through the rescue organizations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Your Responsibilities</h2>
            <p className="text-muted-foreground mb-2">When using our site, you agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Provide accurate information</li>
              <li>Use the site lawfully and respectfully</li>
              <li>Not misuse or attempt to disrupt the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Content & Listings</h2>
            <p className="text-muted-foreground">
              Dog listings and information are provided by rescue organizations. We don't guarantee availability, accuracy, 
              or suitability of any dog listed. Always contact the rescue directly for current information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              The site is provided "as is." We're not liable for any issues arising from adoptions or interactions 
              with rescue organizations. Each rescue operates independently with their own policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Governing Law</h2>
            <p className="text-muted-foreground">
              These terms are governed by the laws of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground">
              Questions? Email us at{' '}
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

export default TermsOfService;
