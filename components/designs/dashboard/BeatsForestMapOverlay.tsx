import React, { memo } from "react";
import { Polygon } from "react-native-maps";

import { BeatPolygon } from "@/utils/beatsKmz/types";

type Props = {
  polygons: BeatPolygon[];
  /** Lighter styling when many beats are on screen (wide zoom). */
  wideView?: boolean;
};

const BeatsForestMapOverlay = ({ polygons, wideView = false }: Props) => {
  if (!polygons.length) return null;

  const strokeColor = wideView ? "rgba(0, 90, 0, 0.55)" : "rgba(0, 100, 0, 0.9)";
  const fillColor = wideView ? "rgba(34, 139, 34, 0.04)" : "rgba(34, 139, 34, 0.12)";
  const strokeWidth = wideView ? 0.5 : 1;

  return (
    <>
      {polygons.map((poly) => (
        <Polygon
          key={`beat-${poly.id}`}
          coordinates={poly.ring}
          strokeColor={strokeColor}
          fillColor={fillColor}
          strokeWidth={strokeWidth}
          tappable={false}
        />
      ))}
    </>
  );
};

export default memo(BeatsForestMapOverlay);
