
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HymnProvider } from './context/HymnContext.tsx';
import hymnService from './services/hymnService.ts';

// MongoDB connection string - in a real app, this would come from environment variables
const MONGODB_URI = 'mongodb+srv://mthodawu:jTmYqy2s1e4o9ySa@tutortrackdb.7ndm2.mongodb.net/';

// Initialize the app and connect to MongoDB
const initApp = async () => {
  try {
    // Initialize the hymn service which will connect to MongoDB
    await hymnService.initializeHymnService(MONGODB_URI);
    
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <HymnProvider>
          <App />
        </HymnProvider>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Show error message
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h1>Failed to initialize application</h1>
          <p>There was an error connecting to the database. Please try refreshing the page.</p>
          <button onclick="window.location.reload()">Refresh</button>
        </div>
      `;
    }
  }
};

initApp();
