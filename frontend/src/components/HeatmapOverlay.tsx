import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

type HeatmapOverlayProps = {
  data: Array<[number, number, number]>;
};

export default function HeatmapOverlay({ data }: HeatmapOverlayProps) {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Create the heat layer
    const heatLayer = L.heatLayer(data, {
      radius: 25,
      blur: 15,
      maxZoom: 13,
      max: 1.0,
      gradient: {
        0.4: "blue",
        0.6: "cyan",
        0.7: "lime",
        0.8: "yellow",
        1.0: "red"
      }
    });

    // Add to map
    heatLayer.addTo(map);

    // Cleanup when component unmounts or data changes
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, data]);

  return null; // This component doesn't render any DOM elements itself
}
