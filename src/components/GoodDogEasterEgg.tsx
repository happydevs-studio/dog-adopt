import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

const GoodDogEasterEgg = () => {
  const [show, setShow] = useState(false);
  const [keySequence, setKeySequence] = useState('');

  useEffect(() => {
    const targetSequences = ['gooddog', 'goodboy', 'goodgirl'];
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const newSequence = (keySequence + e.key.toLowerCase()).slice(-8);
      setKeySequence(newSequence);

      // Check if any target sequence matches
      if (targetSequences.some((seq) => newSequence.includes(seq))) {
        setShow(true);
        setKeySequence(''); // Reset

        // Hide after 4 seconds
        timeout = setTimeout(() => {
          setShow(false);
        }, 4000);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timeout) clearTimeout(timeout);
    };
  }, [keySequence]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="animate-bounce-in">
        <div className="bg-primary/95 backdrop-blur-sm rounded-3xl px-12 py-8 shadow-2xl border-4 border-white">
          <div className="flex items-center gap-4">
            <Heart className="w-12 h-12 text-white animate-pulse" fill="white" />
            <div className="text-white">
              <h2 className="font-display text-4xl font-bold mb-2">Good Dog! 🐾</h2>
              <p className="text-xl">You found the secret! All dogs are good dogs! ❤️</p>
            </div>
            <Heart className="w-12 h-12 text-white animate-pulse" fill="white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodDogEasterEgg;
