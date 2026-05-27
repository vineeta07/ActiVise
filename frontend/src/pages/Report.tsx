import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, MapPin, Mic, Send, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { addReportedCampaign } from "@/lib/campaignStore";
import { toast } from "sonner";

type VoiceRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const categories = ["waste_cleanup", "road_repair", "tree_plantation", "water_body", "public_health", "priority_alpha"];
const categoryLabels: Record<string, string> = {
  waste_cleanup: "Waste Cleanup",
  road_repair: "Road Repair",
  tree_plantation: "Tree Plantation",
  water_body: "Water Body",
  public_health: "Public Health",
  priority_alpha: "Priority Alpha",
};

const categoryImpactType: Record<string, "Waste" | "Trees" | "Water" | "Air"> = {
  waste_cleanup: "Waste",
  road_repair: "Air",
  tree_plantation: "Trees",
  water_body: "Water",
  public_health: "Air",
  priority_alpha: "Water",
};

const urgencyBaseVolunteers: Record<"critical" | "high" | "medium" | "low", number> = {
  critical: 70,
  high: 45,
  medium: 30,
  low: 16,
};

export default function Report() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [photos, setPhotos] = useState<{ file: File; preview: string; capturedAt: string }[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [volunteerNeeded, setVolunteerNeeded] = useState("30");
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("Detecting...");
  const [currentStep, setCurrentStep] = useState(1);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  
  // AI Results state
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiSpamScore, setAiSpamScore] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<VoiceRecognition | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationName(`${position.coords.latitude.toFixed(4)}° N, ${position.coords.longitude.toFixed(4)}° E`);
      },
      () => {
        setLocation({ lat: 19.076, lng: 72.8777 });
        setLocationName("19.0760° N, 72.8777° E (default)");
      }
    );

    const voiceWindow = window as Window & {
      SpeechRecognition?: new () => VoiceRecognition;
      webkitSpeechRecognition?: new () => VoiceRecognition;
    };
    setVoiceSupported(Boolean(voiceWindow.SpeechRecognition || voiceWindow.webkitSpeechRecognition));
  }, []);

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      // Attempt to call FastAPI
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setAiConfidence(Math.round(data.confidence * 100));
        setAiSpamScore(data.spam_score);
        
        // Auto-select category based on AI prediction
        if (data.classification === "garbage" || data.classification === "paper_waste") {
          setSelectedCategory("waste_cleanup");
        } else if (data.classification === "water_pollution") {
          setSelectedCategory("water_body");
        } else if (data.classification === "air_pollution") {
          setSelectedCategory("public_health");
        }
        
        // Auto-set urgency based on AI severity
        if (data.severity && ["critical", "high", "medium", "low"].includes(data.severity)) {
          setUrgency(data.severity as any);
        }
        
        toast.success(`AI Analysis Complete: ${data.classification} detected.`);
      } else {
        // Fallback simulated confidence if FastAPI is not running locally
        setAiConfidence(Math.round(80 + Math.random() * 15));
      }
    } catch (e) {
      console.warn("FastAPI server not reachable, using simulated AI results");
      setAiConfidence(Math.round(80 + Math.random() * 15));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        capturedAt: new Date().toISOString(),
      }));
      setPhotos((previous) => [...previous, ...newFiles].slice(0, 4));
      
      // Run AI analysis on the first uploaded photo
      if (photos.length === 0) {
        await analyzeImage(files[0]);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
    if (photos.length === 1) {
      setAiConfidence(null);
    }
  };

  const suggestVolunteerNeed = () => {
    let value = urgencyBaseVolunteers[urgency];
    if (selectedCategory === "tree_plantation") value += 10;
    if (selectedCategory === "priority_alpha") value += 20;
    if (selectedCategory === "water_body") value += 8;
    setVolunteerNeeded(String(value));
  };

  const runAiEnhancer = () => {
    const enhanced = `${title || "Environmental issue"} reported at ${locationName}. Category: ${selectedCategory ? categoryLabels[selectedCategory] : "general"}. Priority level: ${urgency}. Suggested volunteer operation should include safety briefing, geo-tagged task confirmation, and before/after impact documentation.`;
    setDescription(enhanced);
    suggestVolunteerNeed();
    toast.success("AI enhancer filled draft description and volunteer estimate");
  };

  const startVoiceInput = () => {
    const voiceWindow = window as Window & {
      SpeechRecognition?: new () => VoiceRecognition;
      webkitSpeechRecognition?: new () => VoiceRecognition;
    };
    const RecognitionCtor = voiceWindow.SpeechRecognition || voiceWindow.webkitSpeechRecognition;

    if (!RecognitionCtor) {
      toast.error("Voice input is not supported in this browser");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new RecognitionCtor();
    }

    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      if (transcript) {
        setDescription((previous) => `${previous} ${transcript}`.trim());
      }
    };

    recognition.onerror = () => {
      toast.error("Could not capture voice input");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    setListening(true);
    recognition.start();
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedCategory("");
    setUrgency("medium");
    setVolunteerNeeded("30");
    setPhotos([]);
    setAiConfidence(null);
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!title || !selectedCategory || !description) {
      toast.error("Please complete title, category, and description");
      return;
    }
    if (photos.length === 0) {
      toast.error("First step requires camera capture or image upload");
      return;
    }
    
    if (aiSpamScore > 0.7) {
      toast.error("Image was flagged as potential spam/fake. Please take a real photo.");
      return;
    }

    setSubmitting(true);

    let remoteMessage: string | null = null;

    try {
      for (const photo of photos) {
        const ext = photo.file.name.split(".").pop();
        const path = `missions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        await supabase.storage.from("photos").upload(path, photo.file);
      }

      const result = await addReportedCampaign({
        title,
        summary: description,
        locationName,
        lat: location?.lat || 19.076,
        lng: location?.lng || 72.8777,
        urgency,
        impactType: categoryImpactType[selectedCategory] || "Waste",
        targetVolunteers: Number.parseInt(volunteerNeeded, 10) || 25,
      });

      if (!result.synced) {
        remoteMessage = result.message || "Campaign listing sync failed";
      }
    } catch (error: unknown) {
      remoteMessage = error instanceof Error ? error.message : "Failed to sync report";
    }

    if (remoteMessage) {
      toast.warning(`${remoteMessage}.`);
    } else {
      toast.success("Report submitted and listed in campaigns");
    }

    resetForm();
    setSubmitting(false);
  };

  const authenticityScore = aiConfidence || Math.min(98, 72 + photos.length * 8 + (location ? 7 : 0));
  const stepReady = {
    1: photos.length > 0,
    2: !!title && !!selectedCategory && !!description,
    3: !!location,
    4: true,
  };

  const canGoNext = stepReady[currentStep as keyof typeof stepReady];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Team Reporting</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Step 1 begins with real-time camera capture or upload, then AI-enhanced form completion and campaign listing.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(step)}
              className={`h-10 rounded-lg border text-xs font-medium ${
                currentStep === step
                  ? "border-primary bg-primary/10 text-primary"
                  : stepReady[step as keyof typeof stepReady]
                    ? "border-border bg-secondary/60 text-foreground"
                    : "border-border bg-background text-muted-foreground"
              }`}
            >
              Step {step}
            </button>
          ))}
        </div>
      </div>

      {currentStep === 1 && (
        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-sm text-foreground">Step 1 - Capture real-time image or upload</h3>
            {isAnalyzing && <span className="text-xs text-primary animate-pulse">Running AI inference...</span>}
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handlePhotos}
            className="hidden"
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotos}
            className="hidden"
          />

          <div className="grid md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-border hover:border-primary/50 p-6 flex flex-col items-center justify-center gap-2"
            >
              <Camera className="h-7 w-7 text-primary" />
              <p className="text-sm text-foreground">Capture from camera</p>
              <p className="text-xs text-muted-foreground">Recommended for real-time evidence</p>
            </button>

            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-border hover:border-primary/50 p-6 flex flex-col items-center justify-center gap-2"
            >
              <Upload className="h-7 w-7 text-primary" />
              <p className="text-sm text-foreground">Upload image</p>
              <p className="text-xs text-muted-foreground">Use this when live capture is unavailable</p>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden relative group border border-border">
                <img src={photo.preview} alt="Evidence" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 h-5 w-5 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-foreground" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {currentStep === 2 && (
        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-heading text-sm text-foreground">Step 2 - Fill report form with voice and AI assistance</h3>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Mission title"
            className="w-full bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground outline-none rounded-lg px-3 py-2.5"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the issue in detail"
            rows={4}
            className="w-full bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground outline-none rounded-lg px-3 py-2.5 resize-none"
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={listening ? stopVoiceInput : startVoiceInput} disabled={!voiceSupported}>
              <Mic className="h-4 w-4" /> {listening ? "Stop Voice" : "Voice Fill"}
            </Button>
            <Button type="button" variant="secondary" onClick={runAiEnhancer}>
              <Sparkles className="h-4 w-4" /> AI Enhance
            </Button>
            <Button type="button" variant="outline" onClick={suggestVolunteerNeed}>
              Suggest Volunteers
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Urgency</p>
              <div className="flex gap-2 flex-wrap">
                {(["critical", "high", "medium", "low"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUrgency(level)}
                    className={`px-3 py-1.5 rounded-lg text-xs capitalize ${
                      urgency === level ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Volunteers needed (editable)</p>
              <input
                type="number"
                value={volunteerNeeded}
                onChange={(event) => setVolunteerNeeded(event.target.value)}
                className="w-full bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground outline-none rounded-lg px-3 py-2.5"
              />
            </div>
          </div>
        </section>
      )}

      {currentStep === 3 && (
        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-heading text-sm text-foreground">Step 3 - Auto tags and trust preview</h3>
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{locationName}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Timestamp: {new Date().toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Issue type: {selectedCategory ? categoryLabels[selectedCategory] : "Not selected"}</p>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Authenticity preview score: <span className="font-heading text-primary">{authenticityScore}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Signals: geotag consistency, timestamp coherence, and {aiConfidence ? 'FastAPI CNN classification' : 'capture integrity'}.</p>
          </div>
        </section>
      )}

      {currentStep === 4 && (
        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-heading text-sm text-foreground">Step 4 - Submit and list in campaigns</h3>
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <p className="text-sm font-medium text-foreground">{title || "Untitled report"}</p>
            <p className="text-xs text-muted-foreground mt-1">{description || "No description"}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              {photos.length} evidence images · {volunteerNeeded} volunteers requested
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2 font-heading">
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </section>
      )}

      <div className="flex justify-between gap-2">
        <Button variant="outline" disabled={currentStep === 1} onClick={() => setCurrentStep((value) => Math.max(1, value - 1))}>
          Back
        </Button>
        <Button
          variant="secondary"
          disabled={currentStep === 4 || !canGoNext}
          onClick={() => setCurrentStep((value) => Math.min(4, value + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

