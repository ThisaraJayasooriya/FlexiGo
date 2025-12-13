"use client";
import { useRouter } from "next/navigation";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  href: string;
  elevated?: boolean;
}

interface BottomNavProps {
  items: NavItem[];
  activeTab: string;
  onTabChange?: (tabId: string) => void;
}

export default function BottomNav({ items, activeTab, onTabChange }: BottomNavProps) {
  const router = useRouter();

  const handleTabClick = (item: NavItem) => {
    if (onTabChange) {
      onTabChange(item.id);
    }
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-around py-2">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            
            if (item.elevated) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item)}
                  className="flex flex-col items-center gap-1 -mt-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-r from-[#3F72AF] to-[#112D4E] flex items-center justify-center shadow-xl hover:shadow-2xl transition-all active:scale-95">
                    <div className="text-white">
                      {item.activeIcon}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#112D4E]">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
                  isActive ? "text-[#3F72AF]" : "text-gray-500 hover:text-[#3F72AF]"
                }`}
              >
                <div className="text-2xl">
                  {isActive ? item.activeIcon : item.icon}
                </div>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
