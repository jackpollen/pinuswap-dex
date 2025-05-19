import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2">Pinuswap</h3>
            <p className="text-gray-400">Decentralized Exchange on Pharos Testnet</p>
          </div>
          
          <div className="flex space-x-6">
            <div>
              <h4 className="font-semibold mb-2">Resources</h4>
              <ul className="space-y-1">
                <li><a href="#" className="text-gray-400 hover:text-secondary">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-secondary">GitHub</a></li>
                <li><a href="#" className="text-gray-400 hover:text-secondary">Pharos Testnet</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Community</h4>
              <ul className="space-y-1">
                <li><a href="#" className="text-gray-400 hover:text-secondary">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-secondary">Discord</a></li>
                <li><a href="#" className="text-gray-400 hover:text-secondary">Telegram</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Pinuswap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
