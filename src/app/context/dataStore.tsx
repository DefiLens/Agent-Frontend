"use client";
import DataProvider from "./dataProvider";

export default function DataStore({ children }: { children: React.ReactNode }) {
    return <DataProvider>{children}</DataProvider>;
}
