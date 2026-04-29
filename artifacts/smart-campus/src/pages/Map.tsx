import { useEffect, useState } from "react";
import { useListResources } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";
import { Link } from "wouter";

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const getMarkerIcon = (status: string) => {
  const color = status === "available" ? "#10b981" : status === "in_use" ? "#f59e0b" : "#ef4444";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

export default function Map() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { data: resources } = useListResources(activeFilter !== "all" ? { type: activeFilter } : {});
  const position: [number, number] = [13.9858, 75.5689];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Map</h1>
          <p className="text-muted-foreground mt-1">Live view of resource locations and availability.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['all', 'classroom', 'lab', 'study_room', 'parking'].map(f => (
            <Badge 
              key={f} 
              variant={activeFilter === f ? "default" : "outline"} 
              onClick={() => setActiveFilter(f)}
              className="capitalize cursor-pointer hover:bg-muted py-1.5 px-3 transition-colors"
            >
              {f.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </div>

      <Card className="flex-1 min-h-[600px] border-border/50 shadow-sm overflow-hidden relative">
        <MapContainer center={position} zoom={17} className="w-full h-full z-0" style={{ height: "600px" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {resources?.map(resource => (
            <Marker 
              key={resource.id} 
              position={[resource.lat || 13.9858, resource.lng || 75.5689]}
              icon={getMarkerIcon(resource.status)}
            >
              <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                <div className="p-1 w-64">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] capitalize mb-1">{resource.type.replace('_', ' ')}</Badge>
                    <div className="flex h-2 w-2 rounded-full" style={{ backgroundColor: resource.status === 'available' ? '#10b981' : '#f59e0b' }} />
                  </div>
                  <h3 className="font-bold text-base mb-1">{resource.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <MapPin className="h-3 w-3 mr-1" /> {resource.building}, Fl {resource.floor}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <Users className="h-3 w-3 mr-1" /> Cap: {resource.capacity}
                  </div>
                  <Link href={`/resources/${resource.id}`}>
                    <Button size="sm" className="w-full h-8 text-xs">Book Now</Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute bottom-6 right-6 z-[400] bg-card/90 backdrop-blur border border-border/50 p-4 rounded-xl shadow-lg">
          <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" /> Available</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white" /> In Use</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" /> Maintenance</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
