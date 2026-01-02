// src/components/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
  if (pathname !== '/pets') {
    window.scrollTo(0, 0);
  }
}, [pathname]);

  return null; 
}