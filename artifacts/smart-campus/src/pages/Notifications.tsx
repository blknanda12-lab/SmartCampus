import { useListNotifications, useMarkNotificationRead, useMarkAllRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Check, CheckCheck, Info, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: notifications } = useListNotifications(
    { userId: user?.id },
    { query: { refetchInterval: 10000, enabled: !!user?.id, queryKey: getListNotificationsQueryKey({ userId: user?.id }) } }
  );

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  const handleMarkAllRead = () => {
    if (user?.id) {
      markAllRead.mutate({ params: { userId: user.id } }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
      });
    }
  };

  const getIcon = (type: string) => {
    if (type === 'success') return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    if (type === 'error') return <XCircle className="h-5 w-5 text-red-500" />;
    return <Info className="h-5 w-5 text-indigo-500" />;
  };

  const getBorderColor = (type: string) => {
    if (type === 'success') return "border-l-emerald-500";
    if (type === 'warning') return "border-l-amber-500";
    if (type === 'error') return "border-l-red-500";
    return "border-l-indigo-500";
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated on your bookings and campus alerts.</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllRead} disabled={unreadCount === 0 || markAllRead.isPending}>
          <CheckCheck className="h-4 w-4 mr-2" /> Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary hover:bg-primary/30">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6 space-y-4">
          <NotificationList 
            notifications={notifications || []} 
            getIcon={getIcon} 
            getBorderColor={getBorderColor}
            onMarkRead={handleMarkRead}
            isPending={markRead.isPending}
          />
        </TabsContent>
        
        <TabsContent value="unread" className="mt-6 space-y-4">
          <NotificationList 
            notifications={(notifications || []).filter(n => !n.read)} 
            getIcon={getIcon} 
            getBorderColor={getBorderColor}
            onMarkRead={handleMarkRead}
            isPending={markRead.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationList({ notifications, getIcon, getBorderColor, onMarkRead, isPending }: any) {
  if (notifications.length === 0) {
    return (
      <Card className="p-12 text-center border-border/50 border-dashed bg-muted/20">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">You're all caught up!</h3>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">No new notifications at the moment.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notif: any) => (
        <Card 
          key={notif.id} 
          className={`border-l-4 overflow-hidden shadow-sm transition-all hover:shadow-md ${getBorderColor(notif.type)} ${!notif.read ? 'bg-card' : 'bg-muted/30 border-r-border/50 border-t-border/50 border-b-border/50'}`}
        >
          <div className="p-4 flex gap-4 sm:items-center flex-col sm:flex-row">
            <div className="shrink-0 pt-1 sm:pt-0">
              {getIcon(notif.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {notif.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                {notif.relatedBookingId && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-primary hover:underline cursor-pointer">View Booking #{notif.relatedBookingId}</span>
                  </>
                )}
              </p>
            </div>
            {!notif.read && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="shrink-0 self-start sm:self-center h-8 px-3 rounded-full hover:bg-primary/10 hover:text-primary"
                onClick={() => onMarkRead(notif.id)}
                disabled={isPending}
              >
                <Check className="h-4 w-4 mr-1.5" /> Mark read
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
