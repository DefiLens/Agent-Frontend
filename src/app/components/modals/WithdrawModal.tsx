import React, { useState, useEffect } from "react";
import { useBalance } from "wagmi";
import { useCallsStatus, useSendCalls } from "wagmi/experimental";
import { FiX } from "react-icons/fi";
import { RiExternalLinkLine } from "react-icons/ri";
import { USDC_ADDRESS, memeCoinData } from "../../utils/constant";
import { decreasePowerByDecimals } from "../../utils/helper";
import { toast } from "react-toastify";
import Loader from "../shared/Loader";
import Dropdown from "../shared/Dropdown"; // Import custom Dropdown
import { buildERC20TransferTransaction } from "../../utils/erc20Utils";
import { parseUnits } from "viem";

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    userAddress: string;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, userAddress }) => {
    const [selectedToken, setSelectedToken] = useState(USDC_ADDRESS);
    const [amount, setAmount] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [tokenDecimal, setTokenDecimal] = useState(6); // Default for USDC
    const [isLoading, setIsLoading] = useState(false);

    const { sendCallsAsync, data: callsId, status: sendCallsStatus } = useSendCalls();
    const { data: callsStatus } = useCallsStatus({ id: callsId as string });

    useEffect(() => {
        const handleTransactionSave = async () => {
            if (callsStatus?.status === "CONFIRMED" && callsStatus.receipts && callsStatus.receipts.length > 0) {
                const txHash = callsStatus.receipts[0].transactionHash;
                setIsLoading(false)
                try {
                    toast.success(
                        <a
                            href={`https://basescan.org/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-light tracking-wide flex items-center gap-2 hover:text-cyan-400 transition-all duration-200"
                        >
                            Sent: {txHash.substring(0, 5)}...
                            {txHash.substring(txHash.length - 5, txHash.length)}
                            <RiExternalLinkLine className="text-base" />
                        </a>
                    );
                } catch (error) {
                    console.error("Failed to save transaction or reset state:", error);
                }
            }
        };

        handleTransactionSave();
    }, [callsStatus]);

    const { data: balance } = useBalance({
        address: userAddress as `0x${string}`,
        token: selectedToken as `0x${string}`,
    });

    useEffect(() => {
        if (!memeCoinData) return;

        const token = memeCoinData.find((coin) => coin?.detail_platforms?.base?.contract_address === selectedToken);
        if (token) {
            setTokenDecimal(token?.detail_platforms?.base?.decimal_place);
        } else {
            setTokenDecimal(6); // Default for USDC
        }
    }, [selectedToken]);

    const handleWithdraw = async () => {
        if (!amount || !recipientAddress) return;

        setIsLoading(true);
        try {
            const amountInWei = parseUnits(amount, tokenDecimal);
            const transaction = await buildERC20TransferTransaction(selectedToken, recipientAddress, amountInWei);

            const id = await sendCallsAsync({
                calls: [transaction],
                capabilities: {
                    paymasterService: {
                        url: process.env.NEXT_PUBLIC_BASE_PAYMASTER,
                    },
                },
            });

            console.log("Transaction sent:", id);
            toast.info("Withdrawal initiated. Waiting for confirmation...");
        } catch (error) {
            console.error("Error sending transaction:", error);
            toast.error("Failed to initiate withdrawal");
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-B1 p-3 sm:p-6 rounded-lg w-full max-w-xl m-2">
                {" "}
                {/* Increased width and padding */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Withdraw Tokens</h2>{" "}
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <FiX size={24} />
                    </button>
                </div>
                {/* Dropdown */}
                <div className="mb-6">
                    {" "}
                    {/* Added margin below dropdown */}
                    <label className="block text-sm sm:text-base font-semibold text-zinc-200 mb-1">
                        Select Token
                    </label>{" "}
                    {/* Label for dropdown */}
                    <Dropdown selectedToken={selectedToken} setSelectedToken={setSelectedToken} />
                </div>
                {/* Amount Input */}
                <div className="mb-6">
                    {" "}
                    {/* Added margin below input */}
                    <label className="block text-sm sm:text-base font-semibold text-zinc-200 mb-1">Amount</label>{" "}
                    {/* Label for amount */}
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-3 py-2 bg-zinc-700 rounded text-white text-sm sm:text-base outline-none"
                        disabled={isLoading}
                    />
                    <p className="text-sm text-gray-400 mt-2">
                        Balance: {decreasePowerByDecimals(balance?.value || "0", tokenDecimal)}
                    </p>
                </div>
                {/* Recipient Address Input */}
                <div className="mb-6">
                    {" "}
                    {/* Added margin below input */}
                    <label className="block text-sm sm:text-base font-semibold text-zinc-200 mb-1">
                        Recipient Address
                    </label>
                    <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Enter recipient address"
                        className="w-full px-3 py-2 bg-zinc-700 rounded text-white text-sm sm:text-base outline-none"
                        disabled={isLoading}
                    />
                </div>
                {/* Sponsored Note */}
                <p className="text-center text-gray-400 mb-4">
                    Transaction sponsored by <span className="text-white">DeFiLens</span>
                </p>
                {/* Withdraw Button */}
                <button
                    onClick={handleWithdraw}
                    disabled={!amount || !recipientAddress || isLoading}
                    className="w-full bg-zinc-700 text-white px-3 py-2 rounded-lg disabled:bg-opacity-40 flex items-center justify-center text-lg"
                >
                    {isLoading ? (
                        <>
                            <Loader />
                            <span className="ml-2">Processing...</span>
                        </>
                    ) : (
                        "Withdraw"
                    )}
                </button>
            </div>
        </div>
    );
};

export default WithdrawModal;
