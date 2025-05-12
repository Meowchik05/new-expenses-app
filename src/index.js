import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';  // Измените эту строку если используете именованный экспорт
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);