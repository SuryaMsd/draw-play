import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('Main.tsx loading...');

try {
  const root = document.getElementById('app');
  console.log('Root element:', root);
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    console.log('Render called');
  } else {
    console.error('Root element not found');
  }
} catch (err) {
  console.error('Render error:', err);
}
