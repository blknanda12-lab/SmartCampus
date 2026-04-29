import { useState } from "react";
import { useListResources } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Users, Monitor, Wifi, Coffee, Filter, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function Resources() {
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [, setLocation] = useLocation();
  
  const { data: resources, isLoading } = useListResources({ 
    ...(type !== "all" && { type }),
    ...(status !== "all" && { status })
  });

  const getStatusColor = (s: string) => {
    if (s === "available") return "bg-emerald-500";
    if (s === "in_use") return "bg-amber-500";
    if (s === "maintenance") return "bg-red-500";
    return "bg-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Resources</h1>
          <p className="text-muted-foreground mt-1">Browse and book available spaces and equipment.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search resources..." className="pl-9 bg-background" />
            </div>
            
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="classroom">Classroom</SelectItem>
                <SelectItem value="lab">Laboratory</SelectItem>
                <SelectItem value="study_room">Study Room</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="parking">Parking</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in_use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full bg-background">
              <Filter className="h-4 w-4 mr-2" /> More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-[200px] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : resources?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border/50 border-dashed">
          <Monitor className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground">No resources found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Try adjusting your filters to see more available spaces.</p>
          <Button variant="outline" className="mt-6" onClick={() => { setType("all"); setStatus("all"); }}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources?.map((resource, i) => (
            <motion.div 
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-primary/40 to-primary/10" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge variant="outline" className="mb-2 capitalize text-xs font-normal border-primary/20 bg-primary/5 text-primary">
                        {resource.type.replace('_', ' ')}
                      </Badge>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{resource.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-full">
                      <span className="relative flex h-2 w-2">
                        {resource.status === 'available' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${getStatusColor(resource.status)}`}></span>
                      </span>
                      <span className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground">{resource.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 opacity-70" />
                      {resource.building}, Floor {resource.floor}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2 opacity-70" />
                      Capacity: {resource.capacity} people
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {resource.amenities.map(amenity => (
                      <Badge key={amenity} variant="secondary" className="bg-secondary text-[10px] font-normal">
                        {amenity}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Button 
                      variant="default" 
                      className="flex-1 shadow-md shadow-primary/20 cursor-pointer"
                      onClick={() => window.location.href = `/resources/${resource.id}`}
                    >
                      Book Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="shrink-0"
                      onClick={() => window.location.href = `/resources/${resource.id}`}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
