import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Hanya ekspos fungsi seed di mode development (tidak masuk bundle production)
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
