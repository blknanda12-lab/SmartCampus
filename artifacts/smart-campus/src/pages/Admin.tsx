import { useListResources, useSimulateIoT, useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Activity, Server, Zap, RefreshCw, Cpu, Database, Network } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Admin() {
  const { data: resources } = useListResources();
  const { data: health } = useHealthCheck({ query: { refetchInterval: 30000, queryKey: getHealthCheckQueryKey() } });
  const simulateMutation = useSimulateIoT();
  const queryClient = useQueryClient();

  const handleSimulate = () => {
    simulateMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("IoT Simulation Triggered", {
          description: "Sensor readings have been randomized to simulate active campus usage."
        });
        queryClient.invalidateQueries(); // invalidate everything to reflect new state
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground mt-1">System management and infrastructure controls.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 mb-6">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${health?.status === 'ok' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-wider">{health?.status || 'UNKNOWN'}</h3>
                <p className="text-xs text-muted-foreground">All core services operational</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Database className="h-4 w-4" /> Database</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">99.9% Uptime</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Network className="h-4 w-4" /> API Gateway</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">12ms Latency</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Cpu className="h-4 w-4" /> IoT Broker</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Connected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50 shadow-sm border-t-4 border-t-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-500" />
                IoT Simulation Engine
              </CardTitle>
              <CardDescription>Force refresh sensor data for demo purposes</CardDescription>
            </div>
            <Button 
              onClick={handleSimulate} 
              disabled={simulateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${simulateMutation.isPending ? 'animate-spin' : ''}`} />
              {simulateMutation.isPending ? 'Simulating...' : 'Run Simulation'}
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-green-400 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950 pointer-events-none z-10" />
              <div className="space-y-1 opacity-70">
                <p>&gt; INF: Connected to MQTT broker (ssl://iot.campus.edu:8883)</p>
                <p>&gt; INF: Subscribed to 42 active topics</p>
                <p>&gt; INF: Received payload from node_cls_A101 [occupancy: 24/30, temp: 22.4]</p>
                <p>&gt; INF: Received payload from node_lab_B204 [occupancy: 12/20, temp: 21.1]</p>
                <p>&gt; INF: Updating redis cache...</p>
                <p className="text-blue-400">&gt; Waiting for next tick...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Resource Manager</CardTitle>
          <CardDescription>Read-only view of all registered campus resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Resource</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Occupancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {resources?.map(resource => (
                    <tr key={resource.id} className="bg-card hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{resource.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize text-[10px]">{resource.type.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{resource.building} (Fl {resource.floor})</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider
                            ${resource.status === 'available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                              resource.status === 'in_use' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {resource.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${resource.currentOccupancy / resource.capacity > 0.8 ? 'bg-red-500' : 'bg-primary'}`}
                              style={{ width: `${(resource.currentOccupancy / resource.capacity) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{resource.currentOccupancy}/{resource.capacity}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
