import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// DEV ONLY: exposes uploadData() to window for seeding Firestore
if (import.meta.env.DEV) {
  import('./lib/seed').then(({ seedFirestore }) => {
    (window as any).uploadData = seedFirestore;
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
