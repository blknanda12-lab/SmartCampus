import { useState } from "react";
import { useGetCalendar } from "@workspace/api-client-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export default function Bookings() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const from = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const to = format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), 'yyyy-MM-dd');
  
  const { data: events } = useGetCalendar({ from, to });

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i));
  const hours = Array.from({ length: 14 }).map((_, i) => i + 8); // 8am to 9pm

  const getEventStyle = (status: string, priority: number) => {
    if (priority > 1) return "bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300";
    if (status === 'confirmed') return "bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-300";
    if (status === 'pending') return "bg-amber-500/20 border-amber-500/50 text-amber-700 dark:text-amber-300";
    if (status === 'cancelled') return "bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300";
    return "bg-muted border-border text-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage all campus reservations.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-card border border-border/50 rounded-lg p-1 shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 font-medium min-w-[120px] text-center text-sm">
              {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button className="shadow-md shadow-primary/20">
            <CalendarIcon className="mr-2 h-4 w-4" /> New Booking
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="grid grid-cols-8 border-b border-border/50 bg-muted/30">
              <div className="p-3 text-center text-xs font-medium text-muted-foreground border-r border-border/50">Time</div>
              {weekDays.map(day => (
                <div key={day.toISOString()} className={`p-3 text-center border-r border-border/50 last:border-0 ${isSameDay(day, new Date()) ? 'bg-primary/5 text-primary' : ''}`}>
                  <div className="text-xs uppercase font-medium">{format(day, 'EEE')}</div>
                  <div className={`text-xl font-bold mt-1 ${isSameDay(day, new Date()) ? 'text-primary' : 'text-foreground'}`}>{format(day, 'd')}</div>
                </div>
              ))}
            </div>
            
            <div className="overflow-y-auto max-h-[700px] relative">
              {hours.map(hour => (
                <div key={hour} className="grid grid-cols-8 border-b border-border/50 group">
                  <div className="p-2 text-center text-xs text-muted-foreground border-r border-border/50 bg-muted/10">
                    {hour}:00
                  </div>
                  {weekDays.map(day => {
                    // Find events for this cell
                    const cellEvents = events?.filter(e => {
                      const eventDate = new Date(e.start);
                      return isSameDay(eventDate, day) && eventDate.getHours() === hour;
                    }) || [];

                    return (
                      <div key={day.toISOString()} className="p-1 min-h-[80px] border-r border-border/50 last:border-0 hover:bg-muted/30 transition-colors relative cursor-pointer">
                        {cellEvents.map(event => (
                          <div 
                            key={event.id} 
                            className={`absolute inset-x-1 top-1 p-2 rounded border text-xs overflow-hidden shadow-sm ${getEventStyle(event.status, event.priority)}`}
                            style={{ 
                              height: `${(new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60) * 80 - 8}px`,
                              zIndex: 10 
                            }}
                          >
                            <div className="font-semibold truncate">{event.title}</div>
                            <div className="truncate opacity-80">{event.resourceName}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm h-full">
            <div className="p-4 border-b border-border/50 font-semibold flex justify-between items-center bg-muted/30">
              Upcoming
              <Badge variant="secondary" className="bg-primary/10 text-primary">{events?.length || 0}</Badge>
            </div>
            <div className="p-4 space-y-4">
              {events?.slice(0, 5).map(event => (
                <div key={event.id} className="flex gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <div className={`w-1 rounded-full shrink-0 ${
                    event.priority > 1 ? 'bg-blue-500' : 
                    event.status === 'confirmed' ? 'bg-emerald-500' : 
                    event.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm font-semibold">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(event.start), 'MMM d • h:mm a')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.resourceName}</p>
                  </div>
                </div>
              ))}
              {(!events || events.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No upcoming bookings.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
