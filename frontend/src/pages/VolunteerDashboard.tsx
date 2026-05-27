import { useState } from "react";
import { CalendarClock, Camera, CheckCircle2, ClipboardList, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

type Task = {
  id: string;
  title: string;
  objective: string;
  due: string;
  status: "in-progress" | "scheduled" | "done";
  beforeImage: string;
};

const tasks: Task[] = [
  {
    id: "t1",
    title: "Mithi River shoreline cleanup",
    objective: "Collect and sort 35kg of floating plastic",
    due: "Apr 18, 2026",
    status: "in-progress",
    beforeImage: "https://images.unsplash.com/photo-1611270418597-f7f3b2f5f5d1?auto=format&fit=crop&w=720&q=80",
  },
  {
    id: "t2",
    title: "Aarey sapling lane restoration",
    objective: "Plant 20 native saplings with guards",
    due: "Apr 20, 2026",
    status: "scheduled",
    beforeImage: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=720&q=80",
  },
];

export default function VolunteerDashboard() {
  const [activeTask, setActiveTask] = useState(tasks[0]);
  const [afterImage, setAfterImage] = useState<string | null>(null);

  const onUploadAfterImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAfterImage(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Volunteer Workflow Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track assigned tasks, capture completion evidence, and pair before/after proof packages.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-heading text-foreground mb-3">Assigned Tasks</h2>
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setActiveTask(task)}
                className={`w-full rounded-xl border p-3 text-left ${
                  activeTask.id === task.id ? "border-primary bg-primary/10" : "border-border bg-secondary/40"
                }`}
              >
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{task.objective}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Due {task.due}
                  </span>
                  <span className="capitalize">{task.status}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-heading text-foreground">Proof of Work Pairing</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <article className="rounded-xl border border-border bg-secondary/40 overflow-hidden">
              <div className="aspect-video">
                <img src={activeTask.beforeImage} alt="Before" className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-foreground">Before image</p>
                <p className="text-[11px] text-muted-foreground mt-1">Captured at task assignment</p>
              </div>
            </article>

            <article className="rounded-xl border border-border bg-secondary/40 overflow-hidden">
              <div className="aspect-video flex items-center justify-center bg-background/60">
                {afterImage ? (
                  <img src={afterImage} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Upload after image</p>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-foreground">After image</p>
                <p className="text-[11px] text-muted-foreground mt-1">Camera capture required on submit</p>
              </div>
            </article>
          </div>

          <label className="w-full h-11 rounded-lg border border-dashed border-border hover:border-primary/50 bg-background inline-flex items-center justify-center gap-2 text-sm cursor-pointer">
            <UploadCloud className="h-4 w-4" />
            Upload completion evidence
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onUploadAfterImage} />
          </label>

          <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Auto-pairing status: {afterImage ? "Before/After matched" : "Waiting for after image"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Matched sets are sent directly into the AI verification queue for authenticity and impact scoring.
            </p>
          </div>

          <Button className="w-full">Submit Paired Evidence</Button>
        </section>
      </div>
    </div>
  );
}
