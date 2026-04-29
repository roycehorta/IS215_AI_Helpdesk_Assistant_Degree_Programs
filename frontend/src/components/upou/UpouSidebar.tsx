// frontend/src/components/upou/UpouSidebar.tsx
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Conversation } from "@/lib/chat-storage";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CheckSquare,
  ClipboardList,
  History,
  LayoutDashboard,
  MessageSquarePlus,
  MessagesSquare,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// ── Add or remove nav items here only ─────────────────────────
const NAV_ITEMS = [
  { label: "AI Chat",     path: "/",          icon: MessagesSquare  },
  { label: "Checklist",   path: "/checklist", icon: CheckSquare     },
  { label: "Admin",       path: "/admin",     icon: LayoutDashboard },
  { label: "About",       path: "/about",     icon: BookOpen        },
  { label: "Update Log",  path: "/updates",   icon: ClipboardList   },
];

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export function UpouSidebar({
  conversations,
  activeId,
  onNewChat,
  onSelect,
  onDelete,
}: Props) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border/60">
        <div className="flex items-center gap-2 px-1 py-2">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            <img src="/up.png" alt="UP Logo" className="h-12 w-12 object-contain" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-sidebar-foreground">UPOU Helpdesk</span>
            <span className="text-[11px] text-sidebar-foreground/70">AI-Powered Support</span>
          </div>
        </div>

        {/* New Chat — expanded */}
        <div className="px-1 pb-2 group-data-[collapsible=icon]:hidden">
          <Button
            onClick={() => { onNewChat(); navigate("/"); }}
            className="w-full justify-start gap-2 text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:cursor-pointer"
            size="sm"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* New Chat — collapsed icon only */}
        <div className="hidden px-1 pb-2 group-data-[collapsible=icon]:block">
          <Button
            onClick={onNewChat}
            size="icon"
            className="h-9 w-9 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            title="New Chat"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* ── Navigation ── */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                <SidebarMenuItem key={path}>
                  <SidebarMenuButton
                    onClick={() => handleNav(path)}
                    isActive={location.pathname === path}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Recent Chats ── */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            <History className="mr-1 h-3 w-3" /> Recent Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.length === 0 && (
                <li className="px-2 py-2 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                  No conversations yet.
                </li>
              )}
              {conversations.map((c) => (
                <SidebarMenuItem key={c.id}>
                  <SidebarMenuButton
                    onClick={() => { onSelect(c.id); if (isMobile) setOpenMobile(false); }}
                    isActive={c.id === activeId}
                    className={cn(
                      "group/item justify-between",
                      "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                    )}
                    tooltip={c.title}
                  >
                    <span className="truncate">{c.title}</span>
                    <div
                      role="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                      className="ml-auto hidden rounded p-1 hover:bg-sidebar-primary/30 group-hover/item:inline-flex cursor-pointer"
                      aria-label="Delete chat"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60">
        <p className="px-2 py-2 text-[11px] text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          University of the Philippines Open University
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}