import { BigNumberish } from "ethers";
import { BigNumber as bg } from "bignumber.js";
bg.config({ DECIMAL_PLACES: 20 });

export const currencyFormat = (num: number): string => {
    return `$${num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const numberFormat = (num: number): string => {
    return `${num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatPercentage = (percentage: number | null) =>
    percentage ? percentage.toFixed(2) : 'N/A';

export const formatMarketCap = (marketCap: number) => {
    if (marketCap > 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap > 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${(marketCap / 1e3).toFixed(2)}K`;
};

export function decreasePowerByDecimals(
    amount: BigNumberish | string,
    decimals: number
) {
    return bg(amount?.toString()).dividedBy(bg(10).pow(decimals)).toString()
}

export function incresePowerByDecimals(
    amount: BigNumberish | string,
    decimals: number
) {
    return bg(amount.toString()).multipliedBy(bg(10).pow(decimals)).toString();
}

export const shorten = (address: string | undefined) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4, address.length)}`;
};
