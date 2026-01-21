import Header from '@/components/Header';
import RescuesSection from '@/components/RescuesSection';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const Rescues = () => {
  return (
    <>
      <SEO
        title="UK Dog Rescues Directory | Quality Shelters | DogAdopt.co.uk"
        description="Browse quality dog rescue centres across the UK. All rescues are committed to high welfare standards. Find reputable shelters helping dogs find forever homes through ethical adoption."
        canonicalUrl="https://dogadopt.co.uk/rescues"
        keywords="UK dog rescues, dog shelters UK, rescue centres, quality dog rescues, animal rescue directory, dog shelter directory, reputable dog rescues UK, ethical rescue centres"
        ogTitle="UK Dog Rescues Directory | Find Quality Shelters Near You"
        ogDescription="Discover quality dog rescue centres across the UK committed to high animal welfare standards. Find the right rescue to support or adopt from."
        twitterTitle="UK Dog Rescues Directory | Quality Shelters"
        twitterDescription="Browse reputable dog rescue centres across the UK. All committed to high welfare standards and ethical adoption practices."
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <RescuesSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Rescues;
