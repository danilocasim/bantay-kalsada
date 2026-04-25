import { divIcon, point, type DivIcon } from "leaflet";
import {
  CircleAlert,
  Construction,
  Droplets,
  MapPin,
  Signpost,
  TrafficCone,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { CATEGORY_COLOR, type Category, type Severity } from "./types";

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  pothole: Construction,
  flood: Waves,
  drainage: Droplets,
  manhole: CircleAlert,
  sign: Signpost,
  obstruction: TrafficCone,
  other: MapPin,
};

const CATEGORY_ICON_LABEL: Record<Category, string> = {
  pothole: "Construction",
  flood: "Waves",
  drainage: "Droplets",
  manhole: "Circle alert",
  sign: "Signpost",
  obstruction: "Traffic cone",
  other: "Map pin",
};

const SEVERITY_RING_COLOR: Record<Severity, string> = {
  low: "hsl(var(--status-resolved))",
  moderate: "hsl(var(--status-pothole))",
  high: "hsl(var(--status-urgent))",
};

export const getMapCategoryIconLabel = (category: Category): string => CATEGORY_ICON_LABEL[category];

export const getMapSeverityRingColor = (severity: Severity): string => SEVERITY_RING_COLOR[severity];

export const createReportMarkerIcon = ({
  category,
  severity,
  selected = false,
}: {
  category: Category;
  severity: Severity;
  selected?: boolean;
}): DivIcon => {
  const Pin = MapPin;
  const Icon = CATEGORY_ICON[category];
  const pinMarkup = renderToStaticMarkup(<Pin size={44} strokeWidth={2.2} />);
  const iconMarkup = renderToStaticMarkup(<Icon size={18} strokeWidth={2.35} />);

  return divIcon({
    className: "bk-report-marker-wrapper",
    iconSize: point(48, 56),
    iconAnchor: point(24, 50),
    html: `
      <div
        class="bk-report-marker${selected ? " bk-report-marker--selected" : ""}"
        style="--marker-color: ${CATEGORY_COLOR[category]}; --severity-color: ${SEVERITY_RING_COLOR[severity]};"
        aria-hidden="true"
      >
        <span class="bk-report-marker__halo"></span>
        <span class="bk-report-marker__pin">${pinMarkup}</span>
        <span class="bk-report-marker__badge">${iconMarkup}</span>
      </div>
    `,
  });
};
