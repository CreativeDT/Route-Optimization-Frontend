import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; 
import { AuthProvider } from './Context/AuthContext';
import { RefreshProvider  } from './Pages/RefreshContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <RefreshProvider>
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
  </RefreshProvider>
);
