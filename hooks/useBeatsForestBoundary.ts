import { useCallback, useEffect, useState } from "react";
import type { Region } from "react-native-maps";

import {
  beatPolygonsInRegion,
  ensureBeatsForestDataLoaded,
  getBeatsForestDataSync,
  getBeatsLoadState,
  scheduleBeatsForestDataLoad,
} from "@/utils/beatsKmz/beatsKmzService";
import { BeatPolygon } from "@/utils/beatsKmz/types";

export function useBeatsForestBoundary(region: Region | null) {
  const [visiblePolygons, setVisiblePolygons] = useState<BeatPolygon[]>([]);
  const [ready, setReady] = useState(!!getBeatsForestDataSync());
  const [loading, setLoading] = useState(getBeatsLoadState().state === "loading");
  const [error, setError] = useState<string | null>(getBeatsLoadState().error);

  useEffect(() => {
    scheduleBeatsForestDataLoad();
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const data = await ensureBeatsForestDataLoaded();
      if (cancelled) return;
      setLoading(false);
      if (data) {
        setReady(true);
        setError(null);
      } else {
        setReady(false);
        setError(getBeatsLoadState().error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const data = getBeatsForestDataSync();
    if (!data || !region) return;
    setVisiblePolygons(beatPolygonsInRegion(data.polygons, region));
  }, [region, ready]);

  const onRegionChange = useCallback((next: Region) => {
    const data = getBeatsForestDataSync();
    if (!data) return;
    setVisiblePolygons(beatPolygonsInRegion(data.polygons, next));
  }, []);

  return { visiblePolygons, ready, loading, error, onRegionChange };
}
