import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top whenever the route changes.
 * This ensures that navigating to a new page starts at the top of the page.
 * Uses multiple scroll methods to ensure compatibility with mobile browsers.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll immediately
    window.scrollTo(0, 0);
    
    // Also use requestAnimationFrame to ensure it happens after paint
    // This helps with mobile browsers that may delay the scroll
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    
    // Fallback with a small delay for problematic mobile browsers
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
