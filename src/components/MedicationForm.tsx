import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
type MedicationProps = {
  userRole: "patient" | "caretaker";
};
function MedicationForm({ userRole }: MedicationProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const today = new Date().toISOString();

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, linked_patient_id")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const user_id = profile.role === "caretaker" ? profile.linked_patient_id : user.id;

      const { error } = await supabase.from("medications").insert([
        {
          user_id,
          name,
          dosage,
          frequency,
          taken_today: false,
          created_at: today,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Medication added successfully!" });
      setName("");
      setDosage("");
      setFrequency("");
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding medication",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || !frequency) {
      toast({ title: "Please fill in all fields" });
      return;
    }
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input
        placeholder="Medication Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Dosage (e.g., 10mg)"
        value={dosage}
        onChange={(e) => setDosage(e.target.value)}
      />
      <Input
        placeholder="Frequency (e.g., 2 times/day)"
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
      />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add Medication"}
      </Button>
    </form>
  );
}

export default MedicationForm;