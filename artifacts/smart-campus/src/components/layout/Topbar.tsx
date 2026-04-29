import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Bell, Search, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useListNotifications, getListNotificationsQueryKey, useMarkNotificationRead } from "@workspace/api-client-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export function Topbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: notifications } = useListNotifications(
    { userId: user?.id },
    { query: { refetchInterval: 10000, enabled: !!user?.id, queryKey: getListNotificationsQueryKey({ userId: user?.id }) } }
  );

  const markRead = useMarkNotificationRead();

  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const recentNotifications = notifications?.slice(0, 5) || [];

  const getBreadcrumb = () => {
    const parts = location.split("/").filter(Boolean);
    if (parts.length === 0) return "Dashboard";
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  };

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      }
    });
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">{getBreadcrumb()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search resources, bookings..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:ring-primary/50 rounded-full h-9"
          />
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-9 w-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-xl border-border/50">
            <DropdownMenuLabel className="flex items-center justify-between px-2 py-2">
              <span className="font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                  {unreadCount} unread
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-50" />
            <div className="max-h-80 overflow-y-auto">
              {recentNotifications.length > 0 ? (
                recentNotifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 text-sm rounded-xl mb-1 cursor-pointer transition-colors ${!notification.read ? 'bg-muted/50 hover:bg-muted' : 'hover:bg-muted/30'}`}
                    onClick={() => !notification.read && handleMarkRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`w-1 rounded-full shrink-0 ${notification.type === 'error' ? 'bg-red-500' : notification.type === 'warning' ? 'bg-amber-500' : notification.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                      <div>
                        <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
              )}
            </div>
            <DropdownMenuSeparator className="opacity-50" />
            <DropdownMenuItem className="justify-center text-primary font-medium rounded-lg cursor-pointer" onSelect={() => window.location.href = '/notifications'}>
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Badge variant="outline" className="capitalize w-full justify-center">{user?.role}</Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
