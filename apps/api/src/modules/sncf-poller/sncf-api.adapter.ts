import { TrainPosition } from '../trains/train-position.entity';

interface SncfStop {
  stop_point: {
    name: string;
    coord: { lat: string; lon: string };
  };
  base_arrival_time: string;
  amended_arrival_time: string;
  arrival_status: string;
}

interface SncfDisruption {
  id: string;
  status: string;
  severity: { effect: string };
  impacted_objects: {
    pt_object: {
      id: string;
      embedded_type: string;
      trip?: { id: string; name: string };
    };
    impacted_stops: SncfStop[];
  }[];
}

export function adaptDisruptions(
  disruptions: SncfDisruption[],
): Partial<TrainPosition>[] {
  const results: Partial<TrainPosition>[] = [];

  for (const disruption of disruptions) {

  if (disruption.status === 'past') continue;

    for (const obj of disruption.impacted_objects ?? []) {
      const pt = obj.pt_object;
      if (pt.embedded_type !== 'trip' || !pt.trip) continue;

      const delayedStops = (obj.impacted_stops ?? []).filter(
        (s) => s.arrival_status === 'delayed',
      );
      if (!delayedStops.length) continue;

      // Retard max parmi les arrêts impactés
      const maxDelay = Math.max(...delayedStops.map(computeDelaySecs));
      const mostDelayedStop = delayedStops.reduce((a, b) =>
        computeDelaySecs(a) >= computeDelaySecs(b) ? a : b,
      );

      // lineId extrait du trip.id : "SNCF:2026-03-09:866819:1187:Train" → "1187"
      const segments = pt.trip.id.split(':');
      const lineId = segments[3] ?? pt.trip.id;

      results.push({
        trainId: pt.trip.id,
        lineId,
        lineName: `Train ${pt.trip.name}`,
        lat: parseFloat(mostDelayedStop.stop_point.coord.lat),
        lon: parseFloat(mostDelayedStop.stop_point.coord.lon),
        delaySeconds: maxDelay,
        delayStatus: mapEffectToStatus(disruption.severity.effect),
        nextStopName: mostDelayedStop.stop_point.name,
      });
    }
  }

  return results;
}

function computeDelaySecs(stop: SncfStop): number {
  const base = parseTime(stop.base_arrival_time);
  const amended = parseTime(stop.amended_arrival_time);
  return Math.max(0, amended - base);
}

// Parse "165300" → secondes depuis minuit
function parseTime(t: string): number {
  const h = parseInt(t.substring(0, 2), 10);
  const m = parseInt(t.substring(2, 4), 10);
  const s = parseInt(t.substring(4, 6), 10);
  return h * 3600 + m * 60 + s;
}

function mapEffectToStatus(effect: string): string {
  switch (effect) {
    case 'SIGNIFICANT_DELAYS': return 'LATE';
    case 'NO_SERVICE':         return 'VERY_LATE';
    case 'REDUCED_SERVICE':    return 'SLIGHT';
    default:                   return 'ON_TIME';
  }
}