import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/system/ErrorBoundary';
import './services/dbHydrate';
import './services/dbTicketBridge';

// Apply saved theme before first paint
try {
  if (localStorage.getItem('umhlaba_dark') === '1') {
    document.documentElement.classList.add('dark');
  }
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
