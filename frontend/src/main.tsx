import React from 'react';
import { createRoot } from 'react-dom/client';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import App from './App';
import './index.css';

// Get Ethereum provider
function getLibrary(provider) {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </React.StrictMode>
);
