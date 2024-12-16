"use client";
import React, { useState, useMemo, useRef } from "react";
import { IoMdMore, IoMdShareAlt, IoMdTrash } from "react-icons/io";
import { DataState } from "@/app/context/dataProvider";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { IoFilter } from "react-icons/io5";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { LuPencil } from "react-icons/lu";
import { LuTrash2 } from "react-icons/lu";
import axios from "axios";
import { API_URL } from "@/utils/keys";
import { RxCross2 } from "react-icons/rx";
import { MdCheck } from "react-icons/md";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
const Sidebar = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const {
    recentChats,
    selectedChat,
    setSelectedChat,
    setMessages,
    fetchMessages,
  } = DataState();

  // Organize chats by date
  const organizedChats = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 86400000).toDateString();

    // Categorized chats will now use a more complex structure
    const categorizedChats: {
      today: any[];
      yesterday: any[];
      monthYearGroups: { [key: string]: any[] };
      yearGroups: { [key: string]: any[] };
    } = {
      today: [],
      yesterday: [],
      monthYearGroups: {},
      yearGroups: {},
    };

    (recentChats || []).forEach((chat: any) => {
      const chatDate = new Date(chat.createdAt);
      const chatDateString = chatDate.toDateString();

      // Today and Yesterday categorization
      if (chatDateString === today) {
        categorizedChats.today.push(chat);
      } else if (chatDateString === yesterday) {
        categorizedChats.yesterday.push(chat);
      } else {
        // Calculate time difference
        const timeDiff = now.getTime() - chatDate.getTime();
        const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000;

        if (timeDiff < oneYearInMilliseconds) {
          // For chats within the last year, group by month and year
          const monthYearKey = chatDate.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          if (!categorizedChats.monthYearGroups[monthYearKey]) {
            categorizedChats.monthYearGroups[monthYearKey] = [];
          }
          categorizedChats.monthYearGroups[monthYearKey].push(chat);
        } else {
          // For chats older than a year, group by year
          const yearKey = chatDate.getFullYear().toString();
          if (!categorizedChats.yearGroups[yearKey]) {
            categorizedChats.yearGroups[yearKey] = [];
          }
          categorizedChats.yearGroups[yearKey].push(chat);
        }
      }
    });

    return categorizedChats;
  }, [recentChats]);

  const renderChatSection = (
    chats: any[],
    title: string,
    sectionKey: string
  ) => {
    if (chats.length === 0) return null;

    return (
      <div key={sectionKey} className="mb-5">
        <h3 className="text-white text-xs font-semibold mb-3 px-3">{title}</h3>
        {chats.map((chat) => (
          <ChatItem
            key={chat._id}
            chat={chat}
            isSelected={chat._id === selectedChat}
            onSelect={() => {
              setSelectedChat(chat._id);
              fetchMessages(chat._id);
            }}
            onDropdownToggle={(id: any) => {
              setActiveDropdown(activeDropdown === id ? null : id);
            }}
            isDropdownOpen={activeDropdown === chat._id}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-zinc-900/50 flex flex-col h-full overflow-hidden border-r border-zinc-800">
      {/* Header */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src="/assets/snapbam.svg"
              alt="DefiLens"
              className="h-8 w-8 mr-2"
            />
            <img
              src="/assets/snapbam_text.svg"
              alt="DefiLens"
              className="w-24"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedChat(null);
            setMessages([]);
          }}
          className="w-full bg-zinc-800 text-white py-2 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          + New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2 pt-4">
        {renderChatSection(organizedChats.today, "Today", "today-section")}
        {renderChatSection(
          organizedChats.yesterday,
          "Yesterday",
          "yesterday-section"
        )}

        {/* Render Month-Year Groups */}
        {Object.entries(organizedChats.monthYearGroups)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([monthYear, chats]) =>
            renderChatSection(chats, monthYear, `month-year-${monthYear}`)
          )}

        {/* Render Year Groups */}
        {Object.entries(organizedChats.yearGroups)
          .sort(([a], [b]) => parseInt(b) - parseInt(a))
          .map(([year, chats]) =>
            renderChatSection(chats, year, `year-group-${year}`)
          )}
      </div>
    </div>
  );
};

// ChatItem component remains the same as in the previous implementation
const ChatItem = ({
  chat,
  isSelected,
  onSelect,
  onDropdownToggle,
  isDropdownOpen,
}: any) => {
  const { fetchChats, setSelectedChat, setMessages } = DataState();
  const { address } = useAccount();
  const inputRef = useRef<HTMLInputElement>(null); // Reference for the input field

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [newChatName, setNewChatName] = useState<string>("");
  const [changeChatName, setChangeChatName] = useState<boolean>(false);
  const renameChat = async () => {
    try {
      const response = await axios.put(`${API_URL}/chat`, {
        chatId: chat._id,
        chatName: newChatName,
      });
      toast.success("Chat renamed");
      fetchChats();
      setChangeChatName(false);
    } catch (error) {
      console.log("Error Renaming Chat");
    }
  };
  const deleteChat = async () => {
    try {
      const response = await axios.delete(`${API_URL}/chat/one/${chat._id}`);
      toast.success("Chat deleted");
      fetchChats();
      setSelectedChat(null);
      setMessages([]);
    } catch (error) {
      console.log("Error Deleting Chat");
    }
  };
  const deleteAllChats = async () => {
    try {
      const response = await axios.delete(`${API_URL}/chat/all/${address}`);
      toast.success("All Chat Deleted");
      fetchChats();
      setSelectedChat(null);
      setMessages([]);
    } catch (error) {
      console.log("Error deleting all chats");
    }
  };
  const handleKeyDown = (e: any) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      e.preventDefault(); // Prevent the default newline insert
      renameChat();
    }
  };

  return (
    <div
      className={`
        relative group cursor-pointer 
        ${isSelected ? "bg-zinc-800" : "hover:bg-zinc-800/70"}
        px-3 py-2 rounded-lg mb-1 transition-colors group
      `}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        {changeChatName ? (
          <div className="flex gap-1">
            <input
              ref={inputRef}
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm text-zinc-300/90 truncate max-w-[200px] bg-transparent w-full bg-zinc-900 py-1 px-2 rounded-lg focus:ring-1 focus:ring-cyan-700 outline-none"
            />
            <button
              onClick={() => {
                setChangeChatName(false);
                setNewChatName("");
              }}
              className="bg-zinc-900 hover:bg-zinc-800 py-1 px-1.5 rounded-lg"
            >
              <RxCross2 />
            </button>
            <button
              onClick={renameChat}
              className="bg-zinc-900 py-1 px-1.5 rounded-lg"
            >
              <MdCheck />
            </button>
          </div>
        ) : (
          <span className="text-sm text-zinc-300/90 truncate max-w-[200px]">
            {chat.chatName}
          </span>
        )}
        {!changeChatName && (
          <span
            className={`${isDropdownOpen ? "block" : "hidden"} group-hover:block`}
          >
            <DropdownMenu.Root
              open={isDropdownOpen}
              onOpenChange={() => onDropdownToggle(chat._id)}
            >
              <DropdownMenu.Trigger asChild>
                <IoMdMore className="text-zinc-400 hover:text-white" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="text-zinc-200 bg-zinc-900 shadow-lg p-2 border border-zinc-700 rounded-lg overflow-hidden z-20 space-y-1"
                  sideOffset={8}
                >
                  {[
                    {
                      label: "Rename",
                      icon: LuPencil,
                      onClick: () => {
                        setChangeChatName(true);
                        setNewChatName(chat.chatName);
                        setTimeout(() => {
                          inputRef.current?.focus();
                        }, 0);
                      },
                    },
                    {
                      label: "Delete",
                      icon: LuTrash2,
                      onClick: () => {
                        deleteChat();
                      },
                    },
                  ].map((item, index) => (
                    <DropdownMenu.Item key={index} className="DropdownMenuItem">
                      <button
                        onClick={item.onClick}
                        className="px-5 py-2 text-sm w-full text-left bg-1-hover hover:bg-zinc-800 focus:bg-gray-700 rounded-md transition-all duration-150 flex items-center gap-2 outline-none"
                      >
                        <item.icon />
                        {item.label}
                      </button>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </span>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
