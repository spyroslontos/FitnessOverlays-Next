"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDate as formatDateByPreference,
  formatDistance,
  formatElevation,
  formatPace,
  formatSpeed,
  formatHumanDuration,
} from "@/lib/format";

type ActivityDetail = any;

type MetricKey =
  | "distance"
  | "time"
  | "pace"
  | "map"
  | "avgSpeed"
  | "avgHR"
  | "maxHR"
  | "calories"
  | "elevation";

const DEFAULT_SELECTED: MetricKey[] = ["distance", "time", "pace"];

export function ActivityDetailCard({ detail }: { detail: ActivityDetail }) {
  // Log JSON to browser console for easy reference
  useEffect(() => {
    // Intentionally verbose for debugging overlays
    console.log("Activity detail", detail);
  }, [detail]);

  // Preferences (measurement + date)
  const [measurementPreference, setMeasurementPreference] = useState<
    "meters" | "feet"
  >("meters");
  const [datePreference, setDatePreference] = useState<string>("%m/%d/%Y");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/preferences");
        if (!res.ok) return;
        const json = await res.json();
        if (!isMounted) return;
        if (json.measurementPreference === "feet")
          setMeasurementPreference("feet");
        if (typeof json.datePreference === "string")
          setDatePreference(json.datePreference);
      } catch {}
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const [selected, setSelected] = useState<Set<MetricKey>>(
    () => new Set(DEFAULT_SELECTED)
  );

  const isImperial = measurementPreference === "feet";

  const metrics = useMemo(
    () => [
      {
        key: "distance" as const,
        label: "Distance",
        value: () => formatDistance(detail?.distance, isImperial),
      },
      {
        key: "time" as const,
        label: "Time",
        value: () => formatHumanDuration(detail?.moving_time),
      },
      {
        key: "pace" as const,
        label: "Pace",
        value: () =>
          formatPace(detail?.moving_time, detail?.distance, isImperial),
      },
      {
        key: "map" as const,
        label: "Map",
        value: () => (detail?.map ? "Available" : "-"),
      },
      {
        key: "avgSpeed" as const,
        label: "Avg Speed",
        value: () => formatSpeed(detail?.average_speed, isImperial),
      },
      {
        key: "avgHR" as const,
        label: "Avg HR",
        value: () =>
          typeof detail?.average_heartrate === "number"
            ? `${Math.round(detail.average_heartrate)} bpm`
            : "-",
      },
      {
        key: "maxHR" as const,
        label: "Max HR",
        value: () =>
          typeof detail?.max_heartrate === "number"
            ? `${Math.round(detail.max_heartrate)} bpm`
            : "-",
      },
      {
        key: "calories" as const,
        label: "Calories",
        value: () =>
          typeof detail?.calories === "number"
            ? `${Math.round(detail.calories)}`
            : typeof detail?.kilojoules === "number"
            ? `${Math.round(detail.kilojoules)}`
            : "-",
      },
      {
        key: "elevation" as const,
        label: "Elevation",
        value: () => formatElevation(detail?.total_elevation_gain, isImperial),
      },
    ],
    [detail, isImperial]
  );

  const visibleMetrics = metrics.filter((m) => selected.has(m.key));

  const toggleMetric = (key: MetricKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Fabric.js rendering (minimal, mobile-first)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<any>(null);

  const renderFabric = async () => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const mod: any = await import("fabric");
    const fabric = mod.fabric ?? mod;

    // Init once, reuse
    if (!fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasEl, {
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
        enableRetinaScaling: true,
      });
    }
    const f: any = fabricCanvasRef.current;
    f.clear();

    const paddingX = 16;
    const paddingY = 16;
    const labelFont = 12;
    const valueFont = 22;
    const lineGap = 6;
    const blockGap = 10;

    let y = paddingY;
    let maxTextWidth = 0;

    if (visibleMetrics.length === 0) {
      const msg = new fabric.Text("No metrics selected", {
        left: paddingX,
        top: paddingY,
        fontFamily: "ui-sans-serif, system-ui, -apple-system",
        fontWeight: "500",
        fontSize: 14,
        fill: "#6b7280",
        objectCaching: false,
        selectable: false,
        evented: false,
      });
      f.add(msg);
      maxTextWidth = msg.width || 160;
      y += 40;
    } else {
      for (const m of visibleMetrics) {
        const label = new fabric.Text(m.label, {
          left: paddingX,
          top: y,
          fontFamily: "ui-sans-serif, system-ui, -apple-system",
          fontWeight: "500",
          fontSize: labelFont,
          fill: "#6b7280",
          objectCaching: false,
          selectable: false,
          evented: false,
        });
        const valueText = String(m.value() ?? "-");
        const value = new fabric.Text(valueText, {
          left: paddingX,
          top: y + labelFont + lineGap,
          fontFamily: "ui-sans-serif, system-ui, -apple-system",
          fontWeight: "600",
          fontSize: valueFont,
          fill: "#111827",
          objectCaching: false,
          selectable: false,
          evented: false,
        });
        f.add(label, value);
        maxTextWidth = Math.max(
          maxTextWidth,
          label.width || 0,
          value.width || 0
        );
        y += labelFont + lineGap + valueFont + blockGap;
      }
      y -= blockGap;
    }

    const contentWidth = Math.ceil(maxTextWidth) + paddingX * 2;
    const contentHeight = Math.ceil(y + paddingY);

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssWidth = Math.max(300, contentWidth);
    const cssHeight = contentHeight;

    // Fabric logical size
    f.setWidth(cssWidth);
    f.setHeight(cssHeight);
    // Backing store size and CSS size
    const el = f.getElement() as HTMLCanvasElement;
    el.width = Math.round(cssWidth * dpr);
    el.height = Math.round(cssHeight * dpr);
    el.style.width = `${cssWidth}px`;
    el.style.height = `${cssHeight}px`;

    f.renderAll();
  };

  useEffect(() => {
    renderFabric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, detail, isImperial]);

  const exportAsText = async () => {
    const text = visibleMetrics
      .map((m) => `${m.label}\n${String(m.value() ?? "-")}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const exportAsImage = async () => {
    if (!fabricCanvasRef.current) await renderFabric();
    const f: any = fabricCanvasRef.current;
    if (!f) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const url = f.toDataURL({ format: "png", multiplier: dpr });
    const a = document.createElement("a");
    a.href = url;
    a.download =
      (detail?.name ? `${detail.name}-metrics` : "metrics") + `-overlay.png`;
    a.click();
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Header */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-baseline justify-between">
          <Badge variant="secondary">{detail?.sport_type}</Badge>
          <div className="text-xs text-gray-500">
            {detail?.start_date
              ? formatDateByPreference(detail.start_date, datePreference)
              : ""}
          </div>
        </div>
        <h1 className="mt-2 text-2xl font-semibold">
          {detail?.name || "Untitled"}
        </h1>

        {/* Toggle Group (grid rows/cols for mobile) */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {metrics.map((m) => {
            const isOn = selected.has(m.key);
            return (
              <Button
                key={m.key}
                size="sm"
                variant={isOn ? "default" : "outline"}
                className="w-full"
                onClick={() => toggleMetric(m.key)}
              >
                {m.label}
              </Button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={exportAsText}
          >
            Copy as text
          </Button>
          <Button size="sm" className="flex-1" onClick={exportAsImage}>
            Save image
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-3">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
