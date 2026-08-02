import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@xterm/xterm/css/xterm.css';
import './index.css';
import App from './App';
import { ThemeProvider } from './lib/theme';
import { AuthProvider } from './lib/auth';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);
