import Header from '@/components/Header';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const About = () => {
  return (
    <>
      <SEO
        title="About DogAdopt.co.uk | Our Mission & Values | Quality UK Dog Rescues"
        description="Learn about DogAdopt.co.uk - a 100% non-profit platform connecting rescue dogs with loving families. Discover our commitment to quality rescues and high welfare standards across the UK."
        canonicalUrl="https://dogadopt.co.uk/about"
        keywords="about dogadopt, dog rescue mission, ethical pet adoption UK, animal welfare standards, non-profit dog rescue, rescue dog charity, quality dog shelters UK"
        ogTitle="About DogAdopt.co.uk | Our Mission to Help Rescue Dogs Find Forever Homes"
        ogDescription="100% non-profit platform dedicated to connecting rescue dogs from quality shelters with loving families. Learn about our mission and values."
        twitterTitle="About DogAdopt.co.uk | Promoting Ethical Dog Adoption"
        twitterDescription="Discover our mission to help every rescue dog find a forever home through quality, ethical adoption practices."
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <AboutSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default About;
