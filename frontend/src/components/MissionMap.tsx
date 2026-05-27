import { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { campaigns, type Campaign } from "@/data/platformData";
import { useTheme } from "@/components/theme-provider";
import HeatmapOverlay from "./HeatmapOverlay";
import { getHeatmapData } from "@/lib/campaignStore";
import { Layers } from "lucide-react";

const urgencyColor: Record<string, string> = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#10B981",
  low: "#64748b",
};

type MissionMapProps = {
  points?: Campaign[];
  center?: [number, number];
  zoom?: number;
  height?: number;
  showHeatLegend?: boolean;
};

export default function MissionMap({
  points = campaigns,
  center = [19.1, 72.86],
  zoom = 11,
  height = 340,
  showHeatLegend = true,
}: MissionMapProps) {
  const { resolvedTheme } = useTheme();
  const [viewMode, setViewMode] = useState<"points" | "heatmap">("points");
  const [heatData, setHeatData] = useState<Array<[number, number, number]>>([]);

  useEffect(() => {
    getHeatmapData().then(data => {
      // Normalize intensity to 0-1 range for leaflet.heat
      const maxIntensity = Math.max(...data.map(d => d.intensity), 1);
      const formattedData: Array<[number, number, number]> = data.map(d => [
        d.lat, 
        d.lng, 
        d.intensity / maxIntensity
      ]);
      setHeatData(formattedData);
    });
  }, []);

  const mapStyleUrl = resolvedTheme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const hotspots = useMemo(() => {
    return points
      .slice()
      .sort((a, b) => b.co2PotentialKg - a.co2PotentialKg)
      .slice(0, 3);
  }, [points]);

  return (
    <div className="rounded-xl border border-border overflow-hidden relative" style={{ height }}>
      
      {/* Map View Toggle */}
      <div className="absolute top-3 right-3 z-[1000]">
        <button 
          onClick={() => setViewMode(viewMode === "points" ? "heatmap" : "points")}
          className="bg-card/90 backdrop-blur border border-border rounded-lg p-2 shadow-sm flex items-center gap-2 hover:bg-secondary transition-colors"
          title="Toggle Heatmap"
        >
          <Layers className="h-4 w-4 text-foreground" />
          <span className="text-xs font-medium text-foreground">
            {viewMode === "points" ? "Show Heatmap" : "Show Pins"}
          </span>
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer key={resolvedTheme} url={mapStyleUrl} />

        {viewMode === "heatmap" && heatData.length > 0 && (
           <HeatmapOverlay data={heatData} />
        )}

        {viewMode === "points" && hotspots.map((point) => (
          <CircleMarker
            key={`hot-${point.id}`}
            center={[point.lat, point.lng]}
            radius={26}
            pathOptions={{
              color: urgencyColor[point.urgency] || "#10B981",
              fillColor: urgencyColor[point.urgency] || "#10B981",
              fillOpacity: 0.08,
              weight: 1,
            }}
          />
        ))}

        {viewMode === "points" && points.map((m) => (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={Math.max(7, Math.min(13, Math.round(m.co2PotentialKg / 900)))}
            pathOptions={{
              color: urgencyColor[m.urgency] || "#00C47D",
              fillColor: urgencyColor[m.urgency] || "#00C47D",
              fillOpacity: 0.75,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ color: "#111827", fontSize: 12, minWidth: 190 }}>
                <strong>{m.title}</strong>
                <br />
                {m.locationName}
                <br />
                {m.impactType} impact · {m.volunteers} volunteers
                <br />
                Potential: {m.co2PotentialKg.toLocaleString()} kg CO2
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {showHeatLegend && viewMode === "points" && (
        <div className="absolute bottom-3 left-3 rounded-lg border border-border bg-card/90 backdrop-blur px-3 py-2 z-[1000]">
          <p className="text-[11px] font-medium text-foreground">Impact Hotspots</p>
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-red-500" /> High urgency
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Medium urgency
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active zones
            </div>
          </div>
        </div>
      )}
      
      {showHeatLegend && viewMode === "heatmap" && (
        <div className="absolute bottom-3 left-3 rounded-lg border border-border bg-card/90 backdrop-blur px-3 py-2 z-[1000]">
          <p className="text-[11px] font-medium text-foreground">Severity Density</p>
          <div className="mt-1 flex items-center gap-1 w-32 h-2 rounded-full bg-gradient-to-r from-blue-500 via-lime-500 to-red-500"></div>
          <div className="mt-1 flex justify-between w-32 text-[9px] text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  );
}

