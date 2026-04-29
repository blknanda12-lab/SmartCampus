import { 
  useGetAnalyticsSummary,
  useGetUtilizationByType,
  useGetPeakHours,
  useGetBookingTrends,
  useGetUnderusedResources,
  useGetEnergyUsage,
  useGetTopResources,
  useGetInsights
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, Line
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

export default function Analytics() {
  const { data: summary } = useGetAnalyticsSummary();
  const { data: utilization } = useGetUtilizationByType();
  const { data: trends } = useGetBookingTrends();
  const { data: topResources } = useGetTopResources();
  const { data: energy } = useGetEnergyUsage();
  const { data: underused } = useGetUnderusedResources();
  const { data: insights } = useGetInsights();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into campus operations and resource optimization.</p>
        </div>
        <Button variant="outline" className="bg-background">Download Report</Button>
      </div>

      {/* KPI Row reuse */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Bookings", value: summary?.totalBookings || 0, color: "border-blue-500/20" },
          { title: "Avg Utilization", value: `${summary?.utilizationPct || 0}%`, color: "border-indigo-500/20" },
          { title: "Energy Saved", value: `${summary?.energySavedKwh || 0} kWh`, color: "border-emerald-500/20" },
          { title: "Cancellation Rate", value: `${summary?.cancelledPct || 0}%`, color: "border-rose-500/20" },
        ].map(stat => (
          <Card key={stat.title} className={`border-border/50 shadow-sm border-l-4 ${stat.color}`}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className="text-3xl font-bold mt-2">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">30-Day Booking Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trends || []}>
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="cancellations" fill="#ef4444" opacity={0.5} name="Cancellations" />
                <Line type="monotone" dataKey="bookings" stroke="#4f46e5" strokeWidth={3} dot={false} name="Bookings" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Optimization Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {underused?.slice(0, 3).map(resource => (
              <div key={resource.resourceId} className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{resource.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Utilization: <span className="font-bold text-rose-500">{resource.utilizationPct}%</span></p>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Take Action</Button>
                </div>
                <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 p-2.5 rounded-lg text-xs mt-3 flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  {resource.suggestion}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Energy Usage by Building</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energy || []}>
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="kwh" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} name="Total Energy (kWh)" />
                <Area type="monotone" dataKey="wastedKwh" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} name="Wasted Energy (kWh)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top Resources</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topResources || []} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={100} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="bookingCount" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
