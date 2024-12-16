"use client";
import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { IoSend } from "react-icons/io5";
import Loader from "@/shared/Loader";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { DataState } from "@/app/context/dataProvider";

const AutoResizableTextarea = ({
  input,
  setInput,
  loading,
  handleSend,
}: any) => {
  const { isConnected } = useAccount();
  const { messages } = DataState();
  const handleKeyDown = (e: any) => {
    if (
      !loading &&
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      if (!isConnected) {
        toast.error("Connect you wallet first");
        return;
      }
      e.preventDefault(); // Prevent the default newline insert
      handleSend(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {messages.length > 0 && (
        <div className="h-10 bg-white bg-opacity-10 w-full overflow-auto scroll_hide flex items-center px-2 rounded-lg">
          <ul className="flex gap-4 items-center justify-center">
            {suggestionsList?.map((suggestion: any, index: any) => (
              <button
                key={index}
                onClick={() => {
                  if (!isConnected) {
                    toast.error("Connect you wallet first");
                    return;
                  }
                  setInput(suggestion);
                }}
                disabled={loading}
                className="flex items-center gap-3 bg-zinc-900/70 rounded-lg s-text cursor-pointer text-sm md:text-sm font-medium text-nowrap px-5 py-1.5"
              >
                {suggestion}
              </button>
            ))}
          </ul>
        </div>
      )}
      <div className="w-full flex items-center justify-center bg-white bg-opacity-10 rounded-lg p-2 gap-3">
        <div className="flex-1 flex items-center">
          <TextareaAutosize
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={"Ask any question..."}
            minRows={1}
            maxRows={8}
            className="flex-1 min-h-full resize-none bg-transparent outline-none text-p-text text-base p-2 w-full"
          />
        </div>
        <div className="h-full flex gap-2 items-center justify-end">
          {!loading ? (
            <button
              disabled={loading}
              onClick={() => {
                if (!isConnected) {
                  toast.error("Connect you wallet first");
                  return;
                }
                handleSend(input);
                setInput("");
              }}
              className={`rounded-lg h-8 w-8 flex justify-center items-center text-5xl transition-all duration-300 bg-primary-gradient text-white ${
                loading ? "bg-opacity-40" : ""
              }`}
            >
              <IoSend className="text-lg" />
            </button>
          ) : (
            <div className="h-8 w-8 flex justify-center items-center">
              <Loader />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoResizableTextarea;

const suggestionsList: any = [
  "Create Trade",
  "Create Transfer",
  "Show my portfolio",
  "Show top Memecoins",
  "Show top Memecoins",
  "Get all transactions",
  "Get usdc balance",
  "Get eth balance",
  "Search on web",
];
