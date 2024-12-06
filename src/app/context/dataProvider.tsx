import React, { createContext, useContext } from "react";
import BigNumber from "bignumber.js";
BigNumber.config({ DECIMAL_PLACES: 10 });

export const DataContext = createContext<any | null>(null);

const DataProvider = ({ children }: any) => {
  return <DataContext.Provider value={{}}>{children}</DataContext.Provider>;
};

export const DataState = () => {
  return useContext(DataContext);
};

export default DataProvider;
