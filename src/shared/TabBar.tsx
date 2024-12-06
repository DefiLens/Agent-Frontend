import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";
import { FiBookmark, FiCompass, FiUpload } from "react-icons/fi";
import { TiStarFullOutline, TiStarOutline } from "react-icons/ti";

const TabBar = () => {
    const router = useRouter();
    const location = router.pathname;
    return (
        <div className="grid grid-cols-3 sm:flex items-end border-zinc-500 h-10">
            {tabList.map((item) => {
                return (
                    <Link key={item.name} href={item.href}>
                        <button
                            className={`flex items-center justify-center gap-2 font-medium text-[.7rem] sm:text-sm px-3 sm:px-6 py-2 transition-all duration-300 border-b-2 tracking-wide whitespace-nowrap ${
                                location === item.href
                                    ? "border-primary-hover text-zinc-100"
                                    : "border-transparent text-zinc-400 hover:text-zinc-100"
                            }`}
                        >
                            <span>
                                <item.icon className="text-xs sm:text-base" />
                            </span>
                            {item.name}
                            {item.href === "/new-pool" && (
                                <span className="text-[10px] flex items-center gap-2 bg-zinc-800 rounded-xl p-0.5 px-2">
                                    <span className="block animate-ping h-1 w-1 bg-green-500 rounded-full" />
                                    Live
                                </span>
                            )}
                        </button>
                    </Link>
                );
            })}
        </div>
    );
};

export default TabBar;
export const tabList = [
    {
        name: "Market",
        href: "/",
        icon: FiCompass,
    },
    {
        name: "Sell Coins",
        href: "/sell",
        icon: FiUpload,
    },
    {
        name: "Bookmarks",
        href: "/bookmarks",
        icon: TiStarOutline,
    },
    {
        name: "Wallet",
        href: "/wallet",
        icon: TiStarOutline,
    },
];
