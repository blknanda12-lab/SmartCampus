import { useState } from "react";
import { useParams } from "wouter";
import { 
  useGetResource, 
  getGetResourceQueryKey,
  useGetResourceAvailability,
  getGetResourceAvailabilityQueryKey
} from "@workspace/api-client-react";
import { format, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Zap, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookingModal } from "@/components/BookingModal";

export default function ResourceDetail() {
  const { id } = useParams();
  const resourceId = parseInt(id || "0", 10);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<number | undefined>();
  
  const handleSlotClick = (hour: number, available: boolean) => {
    if (!available) return;
    setSelectedHour(hour);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedHour(undefined);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-40 bg-muted rounded-3xl" />
      <div className="grid grid-cols-3 gap-6"><div className="col-span-2 h-96 bg-muted rounded-3xl" /><div className="col-span-1 h-96 bg-muted rounded-3xl" /></div>
    </div>;
  }

  if (isNaN(resourceId)) return <div className="p-8 text-center text-muted-foreground">Invalid resource ID</div>;
  if (!resource && !isLoading) return <div className="p-8 text-center text-muted-foreground">Resource not found</div>;

  return (
    <div className="space-y-6">
      <Link href="/resources" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
      </Link>

      <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                {resource.type.replace('_', ' ').toUpperCase()}
              </Badge>
              <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur px-2.5 py-1 rounded-full border border-border">
                <span className={`h-2 w-2 rounded-full ${resource.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-[10px] uppercase font-medium tracking-wider">{resource.status.replace('_', ' ')}</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{resource.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center"><MapPin className="mr-2 h-4 w-4" /> {resource.building}, Floor {resource.floor}</span>
              <span className="flex items-center"><Users className="mr-2 h-4 w-4" /> Capacity: {resource.capacity}</span>
              <span className="flex items-center"><Zap className="mr-2 h-4 w-4" /> {resource.energyUsage} kWh</span>
            </div>
          </div>
          <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20" onClick={() => setIsBookingOpen(true)}>
            Book this Resource
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Schedule</h3>
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                  <Button variant="ghost" size="sm" onClick={() => setDate(addDays(date, -1))}>Prev</Button>
                  <span className="text-sm font-medium px-2">{format(date, 'MMM d, yyyy')}</span>
                  <Button variant="ghost" size="sm" onClick={() => setDate(addDays(date, 1))}>Next</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>8:00 AM</span>
                  <span>2:00 PM</span>
                  <span>9:00 PM</span>
                </div>
                
                <div className="grid grid-cols-14 gap-1 h-16">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const hour = i + 8;
                    const slot = availability?.find(a => a.hour === hour);
                    const isAvailable = slot?.available ?? true;
                    
                    return (
                      <TooltipProvider key={hour}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div 
                              whileHover={isAvailable ? { y: -2, scale: 1.05 } : {}}
                              whileTap={isAvailable ? { scale: 0.95 } : {}}
                              onClick={() => handleSlotClick(hour, isAvailable)}
                              className={`rounded-md cursor-pointer border transition-all ${isAvailable ? 'bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/40 shadow-sm' : 'bg-red-500/20 border-red-500/30 cursor-not-allowed opacity-60'} flex items-center justify-center`}
                            >
                              {!isAvailable && <div className="w-1/2 h-[1px] bg-red-400 rotate-45 opacity-40" />}
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{hour}:00 - {hour+1}:00</p>
                            <p className="text-xs font-bold mt-1" style={{ color: isAvailable ? '#10b981' : '#ef4444' }}>
                              {isAvailable ? 'Available - Click to Book' : `Booked: ${slot?.bookingTitle || 'Reserved'}`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
                
                <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/30" /> Available</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/30" /> Booked</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {resource.amenities.map(amenity => (
                  <Badge key={amenity} variant="secondary" className="px-3 py-1.5 bg-secondary text-secondary-foreground font-normal">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-6">Current Occupancy</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/50" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * (resource.currentOccupancy / resource.capacity))}
                      className="text-primary transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold">{resource.currentOccupancy}</span>
                    <span className="text-xs text-muted-foreground">/ {resource.capacity}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={handleCloseBooking} 
        resourceId={resourceId}
        resourceName={resource.name}
        defaultDate={date}
        defaultHour={selectedHour}
      />
    </div>
  );
}

