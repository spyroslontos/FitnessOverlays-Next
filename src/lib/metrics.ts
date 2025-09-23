export type UnitSystem = "metric" | "imperial"

// Maps Strava measurement preference to our unit system
export const mapStravaUnitsToUnitSystem = (measurementPreference?: string): UnitSystem => {
  // Strava uses "meters" or "feet" - if feet, use imperial, otherwise default to metric
  return measurementPreference === "feet" ? "imperial" : "metric"
}

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
      if (!data?.distance) return "N/A"
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
      if (!data?.moving_time) return "N/A"
      const hours = Math.floor((data.moving_time as number) / 3600)
      const minutes = Math.floor(((data.moving_time as number) % 3600) / 60)
      const seconds = (data.moving_time as number) % 60
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`
      }
      return `${seconds}s`
    },
  },
  {
    key: "pace",
    label: "Pace",
    formatter: (data, unitSystem) => {
      if (!data?.average_speed) return "N/A"
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
      if (!data?.average_speed) return "N/A"
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
  {
    key: "maxSpeed",
    label: "Max Speed",
    formatter: (data, unitSystem) => {
      if (!data?.max_speed) return "N/A"
      if (unitSystem === "imperial") {
        return `${((data.max_speed as number) * 2.237).toFixed(1)} mph`
      }
      return `${((data.max_speed as number) * 3.6).toFixed(1)} km/h`
    },
  },
  {
    key: "elapsedTime",
    label: "Elapsed Time",
    formatter: (data) => {
      if (!data?.elapsed_time) return "N/A"
      const hours = Math.floor((data.elapsed_time as number) / 3600)
      const minutes = Math.floor(((data.elapsed_time as number) % 3600) / 60)
      const seconds = (data.elapsed_time as number) % 60
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`
      }
      return `${seconds}s`
    },
  },
  {
    key: "sufferScore",
    label: "Suffer Score",
    formatter: (data) =>
      data.suffer_score ? data.suffer_score.toString() : "N/A",
  },
  {
    key: "perceivedExertion",
    label: "RPE",
    formatter: (data) =>
      data.perceived_exertion ? `${data.perceived_exertion}/10` : "N/A",
  },
  {
    key: "elevationHigh",
    label: "Max Elevation",
    formatter: (data, unitSystem) => {
      if (!data.elev_high) return "N/A"
      if (unitSystem === "imperial") {
        return `${Math.round((data.elev_high as number) * 3.28084)} ft`
      }
      return `${Math.round(data.elev_high as number)}m`
    },
  },
  {
    key: "kudos",
    label: "Kudos",
    formatter: (data) =>
      data.kudos_count && (data.kudos_count as number) > 0 ? `❤️ ${data.kudos_count}` : "N/A",
  },
  {
    key: "avgPower",
    label: "Avg Power",
    formatter: (data) =>
      data.average_watts ? `${Math.round(data.average_watts as number)}W` : "N/A",
  },
]

export const DEFAULT_METRICS = ["distance", "time", "pace", "avgSpeed"]

export const getMetricByKey = (key: string) =>
  METRICS.find((m) => m.key === key)
