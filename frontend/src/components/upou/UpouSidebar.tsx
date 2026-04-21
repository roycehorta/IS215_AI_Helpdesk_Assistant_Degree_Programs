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
} from "@/components/ui/sidebar";
import type { Conversation } from "@/lib/chat-storage";
import { cn } from "@/lib/utils";
import { History, MessageSquarePlus, MessagesSquare, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export function UpouSidebar({ conversations, activeId, onNewChat, onSelect, onDelete }: Props) {
  const navigate = useNavigate(); // ← add this line
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/60">
        <div className="flex items-center gap-2 px-1 py-2">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
          <img src="/src/img/up.png" alt="UP Logo" className="h-12 w-12 object-contain" />
        </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-sidebar-foreground">UPOU Helpdesk</span>
            <span className="text-[11px] text-sidebar-foreground/70">AI-Powered Support</span>
          </div>
        </div>
        <div className="px-1 pb-2 group-data-[collapsible=icon]:hidden">
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            size="sm"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
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
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive
                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                >
                  <MessagesSquare className="h-4 w-4" />
                  <span>AI Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                {/* <SidebarMenuButton
                  onClick={() => navigate('/admin')}
                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </SidebarMenuButton> */}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
                    onClick={() => onSelect(c.id)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.id);
                      }}
                      className="ml-auto hidden rounded p-1 hover:bg-sidebar-primary/30 group-hover/item:inline-flex cursor-pointer"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="h-3 w-3" />
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
