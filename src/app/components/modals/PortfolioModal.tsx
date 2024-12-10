import React, { useCallback, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import Image from "next/image";
import { ICoinDetails } from "../rebalance/types";
import { DataState } from "../../context/dataProvider";
import Loader from "../shared/Loader";
import { useAccount } from "wagmi";
import { useGlobalStore } from "../../context/global.store";
import Moralis from 'moralis';
import { formatUnits } from "viem";
import { toast } from "react-toastify";

// Portfolio Component
interface PortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen, onClose }) => {
    // const { isTokenBalanceLoading, tokenBalances, totalPortfolioValue } = DataState();
    const { address } = useAccount();
    const { allCoins } = useGlobalStore();
    const [isMoralisInitialized, setIsMoralisInitialized] = useState(false);
    const [isTokenBalanceLoading, setIsTokenBalanceLoading] = useState<boolean>(false);
    const [tokenBalances, setTokenBalances] = useState<ICoinDetails[]>([]);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState<number>(0);
    const [hasInitialFetch, setHasInitialFetch] = useState<boolean>(false);

    async function initializeMoralis() {
        if (!isMoralisInitialized) {
            try {
                await Moralis.start({
                    apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY
                });
                setIsMoralisInitialized(true);
            } catch (error) {
                if (!(error as Error).message.includes('Modules are started already')) {
                    throw error;
                }
            }
        }
    }

    const fetchBalances = useCallback(async () => {
        if (!address) return;
        setIsTokenBalanceLoading(true);
        try {
            await initializeMoralis();
            const response: any = await Moralis.EvmApi.token.getWalletTokenBalances({
                "chain": "0x2105",
                "address": address
            });

            if (!response || !response.jsonResponse) {
                console.error("Invalid response from Moralis");
                return;
            }

            let totalValue = 0;
            const balances = response.jsonResponse
                .map((result: any) => {
                    if (BigInt(result.balance) > 0) {
                        const token = allCoins.find(
                            (obj: any) => obj?.detail_platforms?.base?.toLowerCase() === result.token_address?.toLowerCase()
                        );    
                        if (!token) {
                            console.error(`Token not found for address: ${result.token_address}`);
                            return null;
                        }
                        const balance = formatUnits(BigInt(result.balance), Number(result.decimals));
                        const price = token.current_price || 0;
                        const value = parseFloat(balance) * price;
                        totalValue += value;
                        return {
                            ...token,
                            balance: balance.toString(),
                            value: value.toFixed(2),
                        };
                    } else {
                        console.warn(`Zero balance for token address: ${result.token_address}`);
                        return null;
                    }
                })
                .filter((token: any) => token !== null);

            setTokenBalances(balances);
            setTotalPortfolioValue(totalValue);
            
            // Save to localStorage
            localStorage.setItem('lastFetchTimestamp', Date.now().toString());
            setHasInitialFetch(true);
        } catch (error) {
            console.error("Error fetching balances:", error);
            toast.error("Failed to fetch token balances");
        } finally {
            setIsTokenBalanceLoading(false);
        }
    }, [address, allCoins]);

    useEffect(() => {
        // Check if this is a fresh page load
        const isPageRefresh = !localStorage.getItem('lastFetchTimestamp');
        const shouldFetch = address && 
                            allCoins.length > 0 && 
                            (!hasInitialFetch || isPageRefresh);
      
        if (shouldFetch) {
          fetchBalances();
        }
      
        // Define unload callback outside to ensure it's a single reference
        const unloadCallback = () => {
          localStorage.removeItem('lastFetchTimestamp');
        };
      
        if (typeof window !== 'undefined') {
          window.addEventListener('beforeunload', unloadCallback);
        }
      
        // Cleanup function to handle page unload
        return () => {
          if (typeof window !== 'undefined') {
            window.removeEventListener('beforeunload', unloadCallback);
          }
        };
      }, [address, allCoins, fetchBalances, hasInitialFetch]);
      

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
            <div className="bg-zinc-800 p-3 sm:p-6 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">Token Portfolio</h3>
                        <p className="text-xl text-gray-300 mt-2">Total Value: ${totalPortfolioValue.toFixed(2)}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-zinc-900">
                            <tr className="text-gray-400 border-b border-gray-700">
                                <th className="py-4 px-6 text-lg font-bold">Token</th>
                                <th className="py-4 px-6 text-lg font-bold">Balance</th>
                                <th className="py-4 px-6 text-lg font-bold">Price</th>
                                <th className="py-4 px-6 text-lg font-bold">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tokenBalances.map(
                                (token: ICoinDetails) =>
                                    parseFloat(token.balance || "0") > 0 && (
                                        <tr key={token.id} className="border-b border-gray-700 text-white">
                                            <td className="py-4 px-6 flex items-center">
                                                <div className="h-6 w-6">
                                                    <Image
                                                        src={token.image}
                                                        alt={token.name}
                                                        width={50}
                                                        height={50}
                                                        className="mr-6 rounded-full"
                                                    />
                                                </div>
                                                <span className="text-lg ml-4 font-semibold whitespace-nowrap">
                                                    {token.name}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-lg font-semibold">
                                                {parseFloat(token.balance || "0").toFixed(6)}
                                            </td>
                                            <td className="py-4 px-6 text-lg font-semibold">
                                                ${token.current_price.toFixed(6)}
                                            </td>
                                            <td className="py-4 px-6 text-lg font-semibold">
                                                ${parseFloat(token.value || "0").toFixed(2)}
                                            </td>
                                        </tr>
                                    )
                            )}
                        </tbody>
                    </table>
                    {isTokenBalanceLoading && (
                        <div className="flex items-center justify-center text-center py-4 text-white mt-5">
                            <Loader />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PortfolioModal;
