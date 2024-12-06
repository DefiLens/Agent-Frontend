import React, { useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { IoIosArrowDown } from "react-icons/io";
import { LuLogOut } from "react-icons/lu";
import { IoWalletOutline } from "react-icons/io5";
import { FiCompass, FiDownload, FiUpload } from "react-icons/fi";
import Link from "next/link";
import useClickOutside from "@/hooks/useClickOutside";
import AvatarIcon from "@/shared/Avatar";
import { shorten } from "@/utils/helper";
import CopyButton from "@/shared/CopyButton";
import { usePathname } from "next/navigation";

const Header: React.FC = () => {
  const location = usePathname();
  const [showDropDown, setShowDropdown] = useState(false);
  const walletAddressRef = useRef(null);
  const { address, isConnected } = useAccount();
  useClickOutside([walletAddressRef], () => {
    setShowDropdown(false);
  });

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

  // Effect to save user address after successful connection
  // useEffect(() => {
  //   if (isConnected && address) {
  //     handleLogin(address);
  //   }
  // }, [isConnected, address]);

  return (
    <header className="bg-zinc-950 h-[60px] flex items-center border-b border-zinc-700">
      <div className="w-full flex justify-between items-center px-4">
        <div className="flex items-center">
          <div className="flex items-center">
            <img
              height={50}
              width={50}
              src="/assets/snapbam.svg"
              alt="DefiLens"
              className="h-8 w-8 mr-2 block"
            />
            <img
              height={50}
              width={50}
              src="/assets/snapbam_text.svg"
              alt="DefiLens"
              className="w-24 mr-2"
            />
          </div>
          <div className="hidden sm:flex items-end border-zinc-500 h-10 ml-10">
            {/* {tabList.map((item) => {
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`flex items-center justify-center gap-2 text-[.7rem] sm:text-sm px-3 sm:px-3.5 py-2 transition-all duration-300 tracking-wide whitespace-nowrap font-semibold cursor-pointer ${
                      location === item.href
                        ? " text-cyan-600"
                        : "text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    {item.name}
                    {item.href === "/new-pool" && (
                      <span className="text-[10px] flex items-center gap-2 bg-zinc-800 rounded-xl text-zinc-200 p-0.5 px-2">
                        <span className="block animate-ping h-1 w-1 bg-green-500 rounded-full" />
                        Live
                      </span>
                    )}
                  </div>
                </Link>
              );
            })} */}
          </div>
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
          {isConnected && (
            <div
              onClick={() => setShowDropdown(!showDropDown)}
              ref={walletAddressRef}
              className="relative flex justify-center items-center gap-3 sm:px-5 sm:py-2 rounded-full sm:rounded-xl transition duration-300 cursor-pointer bg-zinc-800 hover:bg-opacity-60"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <AvatarIcon address={String(address)} />
              </div>
              <span className="hidden sm:inline text-white rounded-full text-base font-semibold">
                {shorten(address)}
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
                          <AvatarIcon address={String(address)} />
                        </div>
                        <span className="text-white rounded-full text-sm sm:text-lg font-semibold">
                          {shorten(String(address))}
                        </span>
                        <CopyButton
                          copy={String(address)}
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
    </header>
  );
};

export default Header;
export const tabList = [
  {
    name: "Home",
    href: "/",
    icon: FiCompass,
  },
];
