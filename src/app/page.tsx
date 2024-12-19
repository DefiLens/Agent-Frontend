// import Header from "./components/base/Header";
// import Sidebar from "./components/base/Sidebar";
// import Message from "./components/chat/Message";

// export default function CryptoAIChat() {
//   return (
//     <div className="flex flex-col !max-h-[100svh] h-full bg-zinc-950 text-white border-2">
//       <div className="fixed bottom-2 right-2 text-sm bg-zinc-950 px-3 py-0.5 rounded-full border-amber-500 text-amber-500 tracking-wide border">
//         Beta
//       </div>
//       <div className="flex">
//         <div
//           className={`w-72 max-h-[100svh] relative overflow-hidden transform transition-all duration-150 border-2 border-green-600`}
//         >
//           <Sidebar />
//         </div>
//         <div className="border-2 border-pink-600 max-h-[100svh] h-full w-full">
//           <Header />
//           <div className="h-[calc(100svh-60px)]">
//             <Message />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import Header from "./components/base/Header";
import Sidebar from "./components/base/Sidebar";
import Message from "./components/chat/Message";
import { RxHamburgerMenu } from "react-icons/rx";
import { RxCross1 } from "react-icons/rx";

export default function CryptoAIChat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col !max-h-[100svh] h-full bg-zinc-950 text-white">
      <div className="hidden md:block fixed bottom-2 right-2 text-sm bg-zinc-950 px-3 py-0.5 rounded-full border-amber-500 text-amber-500 tracking-wide border">
        Beta
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div
          className={`fixed lg:relative z-40 w-64 max-h-[100svh] max-lg:h-full overflow-hidden transform transition-transform duration-200 max-md:bg-zinc-900 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
        </div>

        {/* Overlay for smaller screens when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 max-h-[100svh] h-full w-full">
          <Header />

          {/* Toggle button for the sidebar on smaller screens */}
          {!isSidebarOpen && (
            <button
              className="lg:hidden fixed top-4 left-4 z-50 text-white px-2 py-1 text-lg hover:bg-zinc-800 rounded"
              onClick={toggleSidebar}
            >
              <RxHamburgerMenu />
            </button>
          )}
          {/* ? <RxCross1 /> */}
          <div className="h-[calc(100svh-60px)] overflow-y-auto">
            <Message />
          </div>
        </div>
      </div>
    </div>
  );
}
