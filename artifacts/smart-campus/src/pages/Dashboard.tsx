import { useAuth } from "@/hooks/use-auth";
import { 
  useGetAnalyticsSummary, 
  useGetUtilizationByType, 
  useGetBookingTrends, 
  useGetRoleBreakdown, 
  useListBookings, 
  useGetInsights, 
  useListSensors,
  getListSensorsQueryKey,
  useListResources,
  useSuggestSlots,
  useGetPeakHours
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { 
  Box, Zap, CalendarCheck, TrendingUp, Sparkles, 
  Activity, Clock, MapPin, Search 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good morning, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-muted-foreground mt-1">Here is your campus overview for {format(new Date(), 'EEEE, MMMM d')}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 rounded-full capitalize border-primary/20 bg-primary/5 text-primary text-sm font-medium">
            {user?.role} Portal
          </Badge>
        </div>
      </div>

      {user?.role === 'admin' && <AdminDashboard />}
      {user?.role === 'faculty' && <FacultyDashboard />}
      {user?.role === 'student' && <StudentDashboard />}
    </div>
  );
}

function AdminDashboard() {
  const { data: summary } = useGetAnalyticsSummary();
  const { data: utilization } = useGetUtilizationByType();
  const { data: trends } = useGetBookingTrends();
  const { data: roles } = useGetRoleBreakdown();
  const { data: recentBookings } = useListBookings({ status: 'confirmed' });
  const { data: insights } = useGetInsights();
  const { data: sensors } = useListSensors({ query: { refetchInterval: 5000, queryKey: getListSensorsQueryKey() } });

  const stats = [
    { title: "Total Resources", value: summary?.totalResources || 0, icon: Box, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Bookings", value: summary?.activeBookingsToday || 0, icon: CalendarCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Utilization", value: `${summary?.utilizationPct || 0}%`, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { title: "Energy Saved", value: `${summary?.energySavedKwh || 0} kWh`, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 shadow-sm overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 dark:from-white/5 dark:to-white/0 pointer-events-none" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 100, delay: i * 0.1 + 0.2 }}
                      className="text-3xl font-bold mt-2"
                    >
                      {stat.value}
                    </motion.div>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Resource Utilization</CardTitle>
            <CardDescription>Daily breakdown by resource type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilization || []}>
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="classroom" stackId="a" fill="#4f46e5" radius={[0, 0, 4, 4]} name="Classrooms" />
                <Bar dataKey="lab" stackId="a" fill="#10b981" name="Labs" />
                <Bar dataKey="study_room" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Study Rooms" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights?.slice(0, 3).map((insight) => (
              <div key={insight.id} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="font-medium text-sm text-foreground flex items-center gap-2 mb-1">
                  {insight.type === 'optimization' && <TrendingUp className="h-4 w-4 text-primary" />}
                  {insight.type === 'warning' && <Activity className="h-4 w-4 text-amber-500" />}
                  {insight.title}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.message}</p>
                {insight.actionLabel && (
                  <Button variant="link" size="sm" className="mt-2 h-auto p-0 text-primary">
                    {insight.actionLabel} &rarr;
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-500" />
                Live IoT Feed
              </div>
              <div className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sensors?.slice(0, 4).map((sensor) => (
              <div key={sensor.resourceId} className="flex flex-col gap-2 p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{sensor.resourceName}</span>
                  <Badge variant="outline" className={sensor.status === 'online' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'}>
                    {sensor.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${sensor.occupancyPct > 80 ? 'bg-destructive' : sensor.occupancyPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${sensor.occupancyPct}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{sensor.currentOccupancy}/{sensor.capacity}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings?.slice(0, 5).map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <CalendarCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{booking.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {booking.resourceName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{format(new Date(booking.startTime), 'HH:mm')}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px] uppercase bg-secondary">
                      {booking.userName}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FacultyDashboard() {
  const { user } = useAuth();
  const { data: myBookings } = useListBookings({ userId: user?.id, status: 'confirmed' });
  const { data: resources } = useListResources({ type: 'classroom' });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">My Upcoming Lectures & Labs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myBookings?.slice(0, 4).map(booking => (
                <div key={booking.id} className="flex gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-border/50 pr-4">
                    <span className="text-xs text-muted-foreground uppercase">{format(new Date(booking.date || booking.startTime), 'MMM')}</span>
                    <span className="text-2xl font-bold">{format(new Date(booking.date || booking.startTime), 'd')}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{booking.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {booking.startTime} - {booking.endTime}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {booking.resourceName}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </div>
              ))}
              {(!myBookings || myBookings.length === 0) && (
                <div className="py-8 text-center text-muted-foreground">
                  <CalendarCheck className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p>No upcoming reservations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Quick Book
              <Button variant="ghost" size="sm" className="h-8 text-xs font-normal">View all</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resources?.slice(0, 5).map(res => (
              <div key={res.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors border border-transparent hover:border-border/50 group">
                <div>
                  <p className="font-medium text-sm">{res.name}</p>
                  <p className="text-xs text-muted-foreground">Capacity: {res.capacity}</p>
                </div>
                <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8">
                  Book
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { data: availableRooms } = useListResources({ status: 'available', type: 'study_room' });
  const { data: suggestions } = useSuggestSlots({ type: 'study_room', capacity: 2 });
  const { user } = useAuth();
  const { data: myBookings } = useListBookings({ userId: user?.id, status: 'confirmed' });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Need a place to study?
                </h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  There are currently <strong className="text-foreground">{availableRooms?.length || 0}</strong> study rooms available across campus.
                </p>
              </div>
              <Button size="lg" className="w-full sm:w-auto shrink-0 rounded-full shadow-lg shadow-primary/25">
                Find a Room Now
              </Button>
            </CardContent>
          </Card>

          <h3 className="text-lg font-semibold tracking-tight mt-8 mb-4">Available Now Near You</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableRooms?.slice(0, 4).map(room => (
              <Card key={room.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-base group-hover:text-primary transition-colors">{room.name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {room.building} • Floor {room.floor}
                      </p>
                    </div>
                    <div className="flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {room.amenities.slice(0,2).map(a => (
                      <Badge key={a} variant="secondary" className="text-[10px] font-normal bg-secondary">{a}</Badge>
                    ))}
                    {room.amenities.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">+{room.amenities.length - 2} more</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                AI Suggested Slots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions?.slice(0, 3).map((slot, i) => (
                <div key={i} className="p-3 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">{slot.resourceName}</span>
                    <Badge variant="outline" className="text-[10px] font-normal border-amber-500/30 text-amber-600 bg-amber-500/5">
                      {Math.round(slot.matchScore * 100)}% match
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
                    <Clock className="h-3.5 w-3.5" /> {slot.startHour}:00 - {slot.endHour}:00
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 italic">"{slot.reason}"</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">My Upcomings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myBookings?.slice(0, 3).map(booking => (
                <div key={booking.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-xs">{format(new Date(booking.date || booking.startTime), 'dd')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{booking.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{booking.resourceName} • {booking.startTime}</p>
                  </div>
                </div>
              ))}
              {(!myBookings || myBookings.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming bookings.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
