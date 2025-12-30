import Header from '@/components/Header';
import RescuesSection from '@/components/RescuesSection';
import Footer from '@/components/Footer';

const Rescues = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <RescuesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Rescues;
