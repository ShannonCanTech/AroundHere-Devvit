import React, { useState } from "react";
import { cn } from "../lib/utils";

type SidebarProps = {
  className?: string;
  onNavigate?: (id: string) => void;
};

const MessageCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={cn("w-4 h-4", className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export const CollapsibleSidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("chat");

  const menuItems = [
    { id: "chat", icon: MessageCircleIcon, label: "Chat" },
    { id: "search", icon: SearchIcon, label: "Search" },
    { id: "home", icon: HomeIcon, label: "Home" },
    { id: "places", icon: MapPinIcon, label: "Places" },
  ];

  const handleSelect = (id: string) => {
    setSelected(id);
    onNavigate?.(id);
  };

  return (
    <nav
      className={cn(
        "hidden md:flex sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out border-gray-200 bg-white shadow-sm",
        isOpen ? "w-64" : "w-16",
        className
      )}
    >
      <div className="flex flex-col h-full p-2">
        {/* Logo Section */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-center h-12">
            <div
              className="grid size-10 shrink-0 place-content-center rounded-lg shadow-sm"
              style={{ backgroundColor: "#d93900" }}
            >
              <svg
                width="20"
                height="16"
                viewBox="0 0 50 39"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-white"
              >
                <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" />
                <path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selected === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={cn(
                  "relative flex h-11 w-full items-center rounded-md transition-all duration-200",
                  isSelected
                    ? "text-white shadow-sm border-l-2"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                style={
                  isSelected
                    ? { backgroundColor: "#d93900", borderColor: "#d93900" }
                    : {}
                }
              >
                <div className="grid h-full w-12 place-content-center">
                  <Icon />
                </div>
                {isOpen && (
                  <span
                    className={cn(
                      "text-sm font-medium transition-opacity duration-200",
                      isOpen ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="border-t border-gray-200 transition-colors hover:bg-gray-100"
        >
          <div className="flex items-center p-3">
            <div className="grid size-10 place-content-center">
              <ChevronRightIcon
                className={cn(
                  "transition-transform duration-300 text-gray-500",
                  isOpen ? "rotate-180" : ""
                )}
              />
            </div>
            {isOpen && (
              <span
                className={cn(
                  "text-sm font-medium text-gray-700 transition-opacity duration-200",
                  isOpen ? "opacity-100" : "opacity-0"
                )}
              >
                Collapse
              </span>
            )}
          </div>
        </button>
      </div>
    </nav>
  );
};
