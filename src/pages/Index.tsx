import Header from '@/components/Header';
import Hero from '@/components/Hero';
import DogGrid from '@/components/DogGrid';
import RescuesSection from '@/components/RescuesSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <DogGrid />
        <RescuesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
