import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateBooking } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId?: number;
  resourceName?: string;
  defaultDate?: Date;
  defaultHour?: number;
}

export function BookingModal({ isOpen, onClose, resourceId, resourceName, defaultDate, defaultHour }: BookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateBooking();
  
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState("1");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState(defaultHour ? `${defaultHour.toString().padStart(2, '0')}:00` : "09:00");
  const [endTime, setEndTime] = useState(defaultHour ? `${(defaultHour+1).toString().padStart(2, '0')}:00` : "10:00");
  const [date, setDate] = useState(defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
  
  const [conflictError, setConflictError] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (override = false) => {
    if (!resourceId || !user?.id) return;
    setValidationError(null);
    
    // Combine date and time for ISO strings
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    // Basic sequential and past date validation
    if (start >= end) {
      setValidationError("End time must be after start time.");
      return;
    }

    const now = new Date();
    if (start < now) {
       setValidationError("Cannot book a resource in the past.");
       return;
    }

    const startIso = start.toISOString();
    const endIso = end.toISOString();

    createMutation.mutate({
      data: {
        resourceId,
        userId: user.id,
        title,
        startTime: startIso,
        endTime: endIso,
        attendees: parseInt(attendees, 10) || 1,
        notes,
        override
      }
    }, {
      onSuccess: () => {
        toast({ title: "Booking confirmed!", description: "Your resource has been reserved." });
        queryClient.invalidateQueries(); // Invalidate all to refresh calendar, availability, stats
        setConflictError(null);
        resetForm();
        onClose();
      },
      onError: (err: any) => {
        if (err.data && err.data.conflicts) {
          setConflictError(err.data);
        } else {
          toast({ title: "Booking failed", description: err.message || "An error occurred", variant: "destructive" });
        }
      }
    });
  };

  const resetForm = () => {
    setTitle("");
    setAttendees("1");
    setNotes("");
    setConflictError(null);
    setValidationError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl overflow-hidden border-border/50 shadow-2xl">
        <DialogHeader className="bg-muted/30 p-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl">Book Resource</DialogTitle>
          <DialogDescription>
            {resourceName ? `Reserving ${resourceName}` : "Create a new reservation"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-5">
          {validationError && (
            <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Validation Error</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {conflictError && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Scheduling Conflict Detected</AlertTitle>
              <AlertDescription className="mt-2 text-sm text-foreground">
                <p className="mb-2 text-red-600 dark:text-red-400">{conflictError.error}</p>
                <div className="bg-background/50 rounded p-2 text-xs">
                  {conflictError.conflicts.map((c: any) => (
                    <div key={c.id} className="mb-1 last:mb-0 text-foreground">
                      <strong>{c.title}</strong> by {c.userName} ({format(new Date(c.startTime), 'HH:mm')} - {format(new Date(c.endTime), 'HH:mm')})
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" placeholder="e.g. Study Group, Lab Session" value={title} onChange={e => setTitle(e.target.value)} className="bg-muted/50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendees">Expected Attendees</Label>
              <Input id="attendees" type="number" min="1" value={attendees} onChange={e => setAttendees(e.target.value)} className="bg-muted/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="bg-muted/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" placeholder="Any special requirements..." value={notes} onChange={e => setNotes(e.target.value)} className="resize-none bg-muted/50 h-20" />
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-border/50 bg-muted/10">
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          
          {conflictError && conflictError.canOverride ? (
            <Button variant="destructive" onClick={() => handleSubmit(true)} disabled={createMutation.isPending || !title}>
              Override & Book
            </Button>
          ) : (
            <Button onClick={() => handleSubmit(false)} disabled={createMutation.isPending || !title || !!conflictError} className="shadow-md shadow-primary/20">
              Confirm Booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
