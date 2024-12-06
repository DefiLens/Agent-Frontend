import React from "react";
import { DataState } from "../../context/dataProvider";
import { FaList, FaTh } from "react-icons/fa";

const ViewToggle = () => {
    const { viewMode, setViewMode } = DataState();

    return (
        <div className="flex items-center gap-1 rounded-lg p-1 bg-zinc-900 border border-zinc-800">
            <button
                onClick={() => setViewMode("list")}
                className={`flex items-center justify-center rounded-md p-2 transition-colors
  ${viewMode === "list" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
                aria-label="List view"
            >
                <FaList className="h-4 w-4" />
            </button>
            <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center justify-center rounded-md p-2 transition-colors
  ${viewMode === "grid" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
                aria-label="Grid view"
            >
                <FaTh className="h-4 w-4" />
            </button>
        </div>
    );
};

export default ViewToggle;
