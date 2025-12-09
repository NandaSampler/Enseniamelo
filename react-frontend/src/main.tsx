import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import keycloak from './keycloak';

import './styles.css';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

keycloak
  .init({ onLoad: 'login-required' })
  .then((authenticated) => {
    if (!authenticated) {
      keycloak.login();
    } else {
      root.render(<App />);
    }
  })
  .catch((err) => {
    console.error('Keycloak init error', err);
  });
