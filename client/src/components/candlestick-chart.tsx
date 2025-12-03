import { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import type { Candlestick, TradeMarker } from "@shared/schema";

interface CandlestickChartProps {
  data: Candlestick[];
  markers?: TradeMarker[];
  ticker: string;
}

export function CandlestickChart({ data, markers = [], ticker }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#B0B3C5",
        fontFamily: "JetBrains Mono, monospace",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(0, 255, 148, 0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#151E3F",
        },
        horzLine: {
          color: "rgba(0, 255, 148, 0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#151E3F",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
      },
      handleScroll: {
        vertTouchDrag: true,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00FF94",
      downColor: "#FF4B4B",
      borderUpColor: "#00FF94",
      borderDownColor: "#FF4B4B",
      wickUpColor: "#00FF94",
      wickDownColor: "#FF4B4B",
    });

    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;

    const chartData = data.map((candle) => ({
      time: candle.time as number,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(chartData);

    if (markers.length > 0 && seriesRef.current.setMarkers) {
      const seriesMarkers = markers.map((marker) => ({
        time: marker.time as number,
        position: marker.position as "aboveBar" | "belowBar" | "inBar",
        color: marker.color,
        shape: marker.shape as "circle" | "square" | "arrowUp" | "arrowDown",
        text: marker.text,
      }));
      seriesRef.current.setMarkers(seriesMarkers);
    }

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data, markers]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
        <span className="text-2xl font-bold font-mono text-foreground">
          {ticker}
        </span>
        {data.length > 0 && (
          <>
            <span
              className={`text-lg font-mono ${
                data[data.length - 1].close >= data[data.length - 1].open
                  ? "text-profit"
                  : "text-loss"
              }`}
            >
              ${data[data.length - 1].close.toFixed(2)}
            </span>
            <span
              className={`text-sm ${
                data[data.length - 1].close >= data[data.length - 1].open
                  ? "text-profit"
                  : "text-loss"
              }`}
            >
              {data[data.length - 1].close >= data[data.length - 1].open
                ? "▲"
                : "▼"}
              {Math.abs(
                ((data[data.length - 1].close - data[data.length - 1].open) /
                  data[data.length - 1].open) *
                  100
              ).toFixed(2)}
              %
            </span>
          </>
        )}
      </div>
      <div ref={chartContainerRef} className="h-full w-full" data-testid="chart-container" />
    </div>
  );
}
