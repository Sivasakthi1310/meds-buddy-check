import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useEffect } from "react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  taken_today: boolean;
  date: string;
};

type MedicationProps = {
  userRole: 'patient' | 'caretaker';
};

function MedicationList({ userRole }: MedicationProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('medication-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medications' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['medications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const { data, isLoading, error } = useQuery<Medication[]>({
    queryKey: ['medications'],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not logged in");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, linked_patient_id")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;

      const targetUserId = profile.role === "caretaker" ? profile.linked_patient_id : user.id;

      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const end = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", targetUserId)
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const markTaken = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("medications")
        .update({ taken_today: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Marked as taken" });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
    onError: (error: any) => {
      toast({ title: "Error marking as taken", description: error.message });
    },
  });

  const deleteMed = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Medication deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting medication", description: error.message });
    },
  });

  if (isLoading) return <p className="text-center mt-4">Loading medications...</p>;
  if (error) return <p className="text-center text-red-500">Error loading medications: {error.message}</p>;

  return (
    <div className="space-y-4 my-6 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Today's Medications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data?.length === 0 && <p className="text-muted-foreground">No medications added yet.</p>}
          {data?.map((med) => (
            <div
              key={med.id}
              className="border p-4 rounded-xl shadow-sm hover:shadow-md transition-all bg-white"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="text-lg font-semibold">{med.name}</h4>
                  <p className="text-sm text-muted-foreground">Dosage: {med.dosage}</p>
                  <p className="text-sm text-muted-foreground">Frequency: {med.frequency}</p>
                </div>
                <div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      med.taken_today
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {med.taken_today ? 'Taken' : 'Not Taken'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {!med.taken_today && (
                  <Button
                    size="sm"
                    onClick={() => markTaken.mutate(med.id)}
                    disabled={markTaken.isPending}
                  >
                    {markTaken.isPending ? "Updating..." : "Mark as Taken"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this medication?")) {
                      deleteMed.mutate(med.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default MedicationList;