import { Badge } from "@/components/ui/badge";

type ActivityDetail = any;

export function ActivityDetailCard({ detail }: { detail: ActivityDetail }) {
  return (
    <div className="mt-4 bg-white border rounded-lg p-4">
      <div className="flex items-baseline justify-between">
        <Badge variant="secondary">{detail?.sport_type}</Badge>
        <div className="text-xs text-gray-500">
          {detail?.start_date
            ? new Date(detail.start_date).toLocaleString()
            : ""}
        </div>
      </div>
      <h1 className="mt-2 text-2xl font-semibold">
        {detail?.name || "Untitled"}
      </h1>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div className="rounded bg-gray-50 p-3">
          <div className="text-gray-500">Distance</div>
          <div className="font-medium">
            {typeof detail?.distance === "number"
              ? (detail.distance / 1000).toFixed(2)
              : "-"}{" "}
            km
          </div>
        </div>
        <div className="rounded bg-gray-50 p-3">
          <div className="text-gray-500">Moving Time</div>
          <div className="font-medium">
            {typeof detail?.moving_time === "number"
              ? Math.round(detail.moving_time / 60)
              : "-"}{" "}
            min
          </div>
        </div>
        <div className="rounded bg-gray-50 p-3">
          <div className="text-gray-500">Elev. Gain</div>
          <div className="font-medium">
            {detail?.total_elevation_gain ?? "-"} m
          </div>
        </div>
      </div>

      <pre className="mt-6 text-xs overflow-auto bg-gray-50 p-3 rounded">
        {JSON.stringify(detail, null, 2)}
      </pre>
    </div>
  );
}
