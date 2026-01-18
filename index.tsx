
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <div className="max-w-md mx-auto h-screen bg-black overflow-hidden relative shadow-2xl">
      <App />
    </div>
  </React.StrictMode>
);
