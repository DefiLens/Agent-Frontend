"use client"

import React, { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { IoIosArrowDown } from "react-icons/io";
import { LuLogOut } from "react-icons/lu";
import useClickOutside from "@/hooks/useClickOutside";
import AvatarIcon from "@/shared/Avatar";
import { shorten } from "@/utils/helper";
import CopyButton from "@/shared/CopyButton";
import { API_URL } from "@/utils/contants";
import axios from "axios";
import { MdOutlineFileDownload } from "react-icons/md";
import Image from "next/image";
import DepositModal from "../modals/DepositModal";

const Header: React.FC = () => {
  const [showDropDown, setShowDropdown] = useState(false);
  const walletAddressRef = useRef(null);
  const { address, isConnected } = useAccount();
  useClickOutside([walletAddressRef], () => {
    setShowDropdown(false);
  });

  const [showDepositModal, setShowDepositModal] = useState(false);
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  function connectToSmartWallet() {
    console.log("Connecting");
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === "coinbaseWalletSDK"
    );

    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector });
    }
  }

  const [userAddress, setUserAddress] = useState<string>("");
  const [usdcBalance, setUsdcBalance] = useState<string>("");
  const [loadingUserAddress, setLoadingUserAddress] = useState<boolean>(false);
  const getWallet = async () => {
    try {
      setLoadingUserAddress(true);
      const response = await axios.get(`${API_URL}/wallet/${address}`);
      setUserAddress(response.data.address);
      setUsdcBalance(response.data.usdc);
      setLoadingUserAddress(false);
    } catch (error) {
      console.error(error);
      setLoadingUserAddress(false);
    }
  };

  useEffect(() => {
    if (address) {
      getWallet();
    }
  }, [address]);

  return (
    <header className="bg-zinc-950 h-[60px] flex items-center border-b border-zinc-700">
      <div className="w-full flex justify-between items-center px-4">
        <div className="flex items-center">
          <div className="hidden sm:flex items-end border-zinc-500 h-10 ml-10"></div>
        </div>

        {/* <CoinbaseButton /> */}
        <div className="flex gap-2 items-center">
          {!isConnected && (
            <button
              onClick={connectToSmartWallet}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 hover:bg-opacity-70 transition-all duration-200"
            >
              <span>Connect Wallet</span>
            </button>
          )}
          {isConnected && !loadingUserAddress && (
            <button
              onClick={() => setShowDepositModal(true)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-opacity-70 transition-all duration-200 flex items-center gap-2 pr-2 pl-2"
            >
              <div className="flex items-center gap-2 sm:border-r sm:border-zinc-700 p-2">
                <Image
                  src="/usdc.png"
                  alt="USDC"
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="text-sm text-white">
                  {usdcBalance || "0"} USDC
                </span>
              </div>

              <MdOutlineFileDownload className="hidden sm:inline text-xl" />
            </button>
          )}

          {isConnected && !loadingUserAddress && (
            <div
              onClick={() => setShowDropdown(!showDropDown)}
              ref={walletAddressRef}
              className="relative flex justify-center items-center gap-3 sm:px-5 sm:py-2 rounded-full sm:rounded-xl transition duration-300 cursor-pointer bg-zinc-800 hover:bg-opacity-60"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <AvatarIcon address={String(userAddress)} />
              </div>
              <span className="hidden sm:inline text-white rounded-full text-base font-semibold">
                {shorten(userAddress)}
              </span>
              <IoIosArrowDown
                className={`hidden sm:inline text-white text-xl transition-all duration-150 ${
                  showDropDown ? "rotate-180" : ""
                }`}
              />

              {showDropDown && (
                <div className="absolute top-14 right-0 z-50 flex flex-col justify-center items-start border-1 shadow-xl rounded-lg">
                  {/* SCW Address and Balance */}
                  <div className="bg-zinc-950 border border-zinc-700 w-full relative flex flex-col p-4 gap-2 cursor-default rounded-xl min-w-80">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 p-2">
                        <div className="h-7 w-7 rounded-full overflow-hidden">
                          <AvatarIcon address={String(userAddress)} />
                        </div>
                        <span className="text-white rounded-full text-sm sm:text-lg font-semibold">
                          {shorten(String(userAddress))}
                        </span>
                        <CopyButton
                          copy={String(userAddress)}
                          className="text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-5">
                        <button onClick={() => disconnect()}>
                          <LuLogOut className="text-white text-xl" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          userAddress={userAddress}
        />
      )}
    </header>
  );
};

export default Header;
