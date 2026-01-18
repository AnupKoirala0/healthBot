
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// In this specific task, the UI is provided in index.html as requested (plain HTML/JS)
// But we still need this file to satisfy the framework requirements.
// We will attach our custom logic to the existing DOM elements.

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
