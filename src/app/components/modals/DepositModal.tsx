import CopyButton from "@/shared/CopyButton";
import React from "react";
import { FiExternalLink } from "react-icons/fi";

interface DepositModalProps {
  userAddress: string;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({
  onClose,
  userAddress,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
      <div className="bg-zinc-900 p-3 sm:p-6 rounded-lg max-w-2xl w-full relative m-3">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-zinc-400 hover:text-white"
        >
          ✕
        </button>
        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">
          Deposit USDC
        </h3>
        <p className="mb-2 sm:mb-4 text-zinc-300 text-sm sm:text-base">
          Please send USDC to the following address:
        </p>
        <div className="bg-zinc-800 p-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span className="text-white text-sm sm:text-base font-mono break-all">
              {userAddress}
            </span>
            <div className="flex items-center ml-2">
              <CopyButton
                copy={userAddress}
                className="text-lg ml-2 text-cyan-500 hover:text-cyan-600"
              />
              <a
                href={`https://basescan.org/address/${userAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg ml-2 text-cyan-500 hover:text-cyan-600"
              >
                <FiExternalLink />
              </a>
            </div>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-yellow-500 mb-4">
          Note: Please ensure you are sending USDC on the Base network. USDC
          Contract: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
        </p>
      </div>
    </div>
  );
};

export default DepositModal;
