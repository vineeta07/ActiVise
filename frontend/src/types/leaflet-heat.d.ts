import * as L from 'leaflet';

declare module 'leaflet' {
    function heatLayer(latlngs: Array<[number, number, number]>, options?: HeatMapOptions): HeatLayer;

    interface HeatMapOptions {
        minOpacity?: number;
        maxZoom?: number;
        max?: number;
        radius?: number;
        blur?: number;
        gradient?: { [key: number]: string };
    }

    interface HeatLayer extends Layer {
        setOptions(options: HeatMapOptions): this;
        addLatLng(latlng: [number, number, number]): this;
        setLatLngs(latlngs: Array<[number, number, number]>): this;
        redraw(): this;
    }
}
