import React, { useState } from 'react';
import Image from 'next/image';
import { USDC_ADDRESS, memeCoinData } from '../../utils/constant';

interface Token {
  id: string;
  name: string;
  image: string;
  address: string;
}

interface DropdownProps {
  selectedToken: string;
  setSelectedToken: (token: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ selectedToken, setSelectedToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Merging USDC with memeCoinData for the dropdown options
  const tokens = [
    {
      id: 'usdc',
      name: 'USDC',
      image: '/usdc.png',
      address: USDC_ADDRESS,
    },
    ...memeCoinData.map(coin => ({
      id: coin.id,
      name: coin.name,
      image: coin.image.small,
      address: coin?.detail_platforms?.base?.contract_address,
    })),
  ];

  const handleSelect = (token: Token) => {
    setSelectedToken(token.address);
    setIsOpen(false);
  };

  const selectedTokenInfo = tokens.find((token) => token.address === selectedToken);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-700 px-3 py-2 rounded-lg text-white hover:bg-zinc-600 transition-colors"
      >
        <div className="flex items-center">
          {selectedTokenInfo && (
            <Image
              src={selectedTokenInfo.image}
              alt={selectedTokenInfo.name}
              width={24}
              height={24}
              className="rounded-full mr-4"
            />
          )}
          <span className="text-sm ml-2">{selectedTokenInfo ? selectedTokenInfo.name : 'Select Token'}</span>
        </div>
        <span className="text-sm">&#x25BC;</span> {/* Arrow Down Icon */}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-zinc-800 rounded-lg shadow-lg max-h-60 overflow-auto z-10">
          {tokens.map((token) => (
            <button
              key={token.id}
              onClick={() => handleSelect(token)}
              className="flex items-center w-full px-4 py-3 text-white hover:bg-zinc-700 transition-colors"
            >
              <Image
                src={token.image}
                alt={token.name}
                width={24}
                height={24}
                className="rounded-full mr-4"
              />
              <span className='ml-2'>{token.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
