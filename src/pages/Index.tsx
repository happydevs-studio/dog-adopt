import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import DogGrid from '@/components/DogGrid';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const Index = () => {
  return (
    <>
      <SEO
        title="DogAdopt.co.uk - Adopt Don't Shop | Quality UK Rescues"
        description="100% non-profit. Find rescue dogs from quality UK shelters. See how many dogs need homes. Adopt, don't shop - every dog deserves a second chance."
        canonicalUrl="https://dogadopt.co.uk/"
        keywords="dog adoption UK, rescue dogs, quality rescues, adopt don't shop, dog shelters UK, rescue dog adoption, ethical dog adoption, non-profit dog rescue, adopt a dog UK, dog welfare UK, responsible dog adoption"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <FeaturesSection />
          <DogGrid />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
