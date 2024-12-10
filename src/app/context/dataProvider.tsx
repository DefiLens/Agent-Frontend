"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import BigNumber from "bignumber.js";
import axios from "axios";
import { useAccount } from "wagmi";
import { API_URL } from "@/utils/contants";
BigNumber.config({ DECIMAL_PLACES: 10 });

export const DataContext = createContext<any | null>(null);

const DataProvider = ({ children }: any) => {
  const [recentChats, setRecentChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const { address } = useAccount();
  const [selectedChat, setSelectedChat] = React.useState(null);
  const messageContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isloading, setIsloading] = useState<boolean>(false);
  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/chat?userAddress=${address}&limit=20`
      );

      const chats = response.data.chats;

      setRecentChats(chats);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (address) {
      fetchChats();
    }
  }, [address]);

  const transformChatData = async (data: any) => {
    return data.flatMap((item: any) => [
      { role: "user", content: item.prompt },
      { role: "assistant", content: item.text },
    ]);
  };
  const fetchMessages = async (chatId: string) => {
    try {
      if (chatId === null) {
        return;
      }

      const response = await axios.get(
        `${API_URL}/message?chatId=${chatId}`
      );
      const result = await transformChatData(response.data);
      setMessages(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DataContext.Provider
      value={{
        messageContainerRef,
        bottomRef,
        recentChats,
        selectedChat,
        setSelectedChat,
        isloading,
        setIsloading,
        messages,
        setMessages,
        fetchMessages,
        fetchChats,
        setRecentChats
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const DataState = () => {
  return useContext(DataContext);
};

export default DataProvider;
