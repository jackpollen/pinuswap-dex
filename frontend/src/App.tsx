import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';

// Pages
import Home from './pages/Home';
import Swap from './pages/Swap';
import Liquidity from './pages/Liquidity';
import Farming from './pages/Farming';
import Staking from './pages/Staking';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Context
import { ContractProvider } from './contexts/ContractContext';

// Styles
import './App.css';

// Get Ethereum provider
function getLibrary(provider) {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ContractProvider>
        <Router>
          <div className="app min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="main-content flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/swap" element={<Swap />} />
                <Route path="/liquidity" element={<Liquidity />} />
                <Route path="/farming" element={<Farming />} />
                <Route path="/staking" element={<Staking />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ContractProvider>
    </Web3ReactProvider>
  );
}

export default App;
