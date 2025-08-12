export type UnitPref = "meters" | "feet";

export function isImperialPreference(pref?: string): boolean {
  return pref === "feet";
}

export function formatDate(dateISO: string, pref: string): string {
  const d = new Date(dateISO);
  if (pref === "%m/%d/%Y") {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
  }
  return d.toLocaleString();
}

export const formatDateByPreference = formatDate;

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function formatHumanDuration(totalSeconds?: number): string {
  if (typeof totalSeconds !== "number" || !isFinite(totalSeconds)) return "-";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function formatDistanceWithPref(
  distanceMeters: number,
  pref: UnitPref
): string {
  if (pref === "feet") {
    const feet = distanceMeters * 3.28084;
    const miles = feet / 5280;
    return miles >= 0.1 ? `${miles.toFixed(2)} mi` : `${Math.round(feet)} ft`;
  }
  const km = distanceMeters / 1000;
  return km >= 0.1 ? `${km.toFixed(2)} km` : `${Math.round(distanceMeters)} m`;
}

export function formatDistance(meters?: number, isImperial?: boolean): string {
  if (typeof meters !== "number" || !isFinite(meters)) return "-";
  if (isImperial) {
    const feet = meters * 3.28084;
    const miles = feet / 5280;
    return miles >= 0.1 ? `${miles.toFixed(2)} mi` : `${Math.round(feet)} ft`;
  }
  const km = meters / 1000;
  return km >= 0.1 ? `${km.toFixed(2)} km` : `${Math.round(meters)} m`;
}

export function formatElevation(meters?: number, isImperial?: boolean): string {
  if (typeof meters !== "number" || !isFinite(meters)) return "-";
  if (isImperial) {
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft`;
  }
  return `${Math.round(meters)} m`;
}

export function formatSpeed(
  speedMetersPerSecond?: number,
  isImperial?: boolean
): string {
  if (
    typeof speedMetersPerSecond !== "number" ||
    !isFinite(speedMetersPerSecond)
  )
    return "-";
  if (isImperial) {
    const mph = speedMetersPerSecond * 2.23693629;
    return `${mph.toFixed(1)} mph`;
  }
  const kph = speedMetersPerSecond * 3.6;
  return `${kph.toFixed(1)} km/h`;
}

export function formatPace(
  totalSeconds?: number,
  meters?: number,
  isImperial?: boolean
): string {
  if (
    typeof totalSeconds !== "number" ||
    typeof meters !== "number" ||
    totalSeconds <= 0 ||
    meters <= 0
  )
    return "-";
  if (isImperial) {
    const secondsPerMile = totalSeconds / ((meters * 3.28084) / 5280);
    const m = Math.floor(secondsPerMile / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.round(secondsPerMile % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s} /mi`;
  }
  const secondsPerKm = totalSeconds / (meters / 1000);
  const m = Math.floor(secondsPerKm / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.round(secondsPerKm % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s} /km`;
}

export type ActivityLike = {
  distance: number;
  moving_time: number;
  sport_type?: string;
};

export function paceSpeedLabel(a: ActivityLike) {
  const lower = a.sport_type?.toLowerCase() || "";
  return lower.includes("run") ||
    a.sport_type === "Walk" ||
    a.sport_type === "Hike"
    ? "Pace"
    : "Speed";
}

export function formatPaceOrSpeed(a: ActivityLike, pref: UnitPref): string {
  const km = a.distance / 1000;
  if (km <= 0 || a.moving_time <= 0) return "";
  const isMiles = pref === "feet";
  const isPace = paceSpeedLabel(a) === "Pace";
  if (isPace) {
    const distanceUnits = isMiles ? km / 1.609344 : km;
    const secondsPerUnit = a.moving_time / distanceUnits;
    const m = Math.floor(secondsPerUnit / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(secondsPerUnit % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s} ${isMiles ? "/mi" : "/km"}`;
  }
  if (isMiles) {
    const mph = (a.distance / a.moving_time) * 2.23693629;
    return `${mph.toFixed(1)} mph`;
  }
  const kph = (a.distance / a.moving_time) * 3.6;
  return `${kph.toFixed(1)} km/h`;
}
