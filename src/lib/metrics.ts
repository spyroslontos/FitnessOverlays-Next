export type UnitSystem = "metric" | "imperial"

export interface Metric {
  key: string
  label: string
  formatter: (data: Record<string, unknown>, unitSystem: UnitSystem) => string
}

export const METRICS: Metric[] = [
  {
    key: "distance",
    label: "Distance",
    formatter: (data, unitSystem) => {
      if (unitSystem === "imperial") {
        return `${((data.distance as number) / 1609.34).toFixed(2)} mi`
      }
      return `${((data.distance as number) / 1000).toFixed(2)} km`
    },
  },
  {
    key: "time",
    label: "Time",
    formatter: (data) => {
      const hours = Math.floor((data.moving_time as number) / 3600)
      const minutes = Math.floor(((data.moving_time as number) % 3600) / 60)
      const seconds = (data.moving_time as number) % 60
      return `${hours}h ${minutes}m ${seconds}s`
    },
  },
  {
    key: "pace",
    label: "Pace",
    formatter: (data, unitSystem) => {
      if (unitSystem === "imperial") {
        const pacePerMile = 60 / ((data.average_speed as number) * 2.237) // m/s to mph
        const minutes = Math.floor(pacePerMile)
        const seconds = Math.round((pacePerMile % 1) * 60)
          .toString()
          .padStart(2, "0")
        return `${minutes}:${seconds} /mi`
      }
      const pacePerKm = 60 / ((data.average_speed as number) * 3.6)
      const minutes = Math.floor(pacePerKm)
      const seconds = Math.round((pacePerKm % 1) * 60)
        .toString()
        .padStart(2, "0")
      return `${minutes}:${seconds} /km`
    },
  },
  {
    key: "avgSpeed",
    label: "Avg Speed",
    formatter: (data, unitSystem) => {
      if (unitSystem === "imperial") {
        return `${((data.average_speed as number) * 2.237).toFixed(1)} mph`
      }
      return `${((data.average_speed as number) * 3.6).toFixed(1)} km/h`
    },
  },
  {
    key: "avgHr",
    label: "Avg HR",
    formatter: (data) =>
      data.average_heartrate
        ? `${Math.round(data.average_heartrate as number)} bpm`
        : "N/A",
  },
  {
    key: "maxHr",
    label: "Max HR",
    formatter: (data) =>
      data.max_heartrate
        ? `${Math.round(data.max_heartrate as number)} bpm`
        : "N/A",
  },
  {
    key: "calories",
    label: "Calories",
    formatter: (data) =>
      data.calories ? Math.round(data.calories as number).toString() : "N/A",
  },
  {
    key: "elevation",
    label: "Elevation",
    formatter: (data, unitSystem) => {
      if (!data.total_elevation_gain) return "N/A"
      if (unitSystem === "imperial") {
        return `${Math.round((data.total_elevation_gain as number) * 3.28084)} ft`
      }
      return `${Math.round(data.total_elevation_gain as number)}m`
    },
  },
]

export const DEFAULT_METRICS = ["distance", "time", "pace", "avgSpeed"]

export const getMetricByKey = (key: string) =>
  METRICS.find((m) => m.key === key)
