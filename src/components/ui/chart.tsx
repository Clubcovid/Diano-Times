"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Rectangle,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  type BarProps,
  type LegendProps,
} from "recharts"

import { cn } from "@/lib/utils"
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipContentProps,
} from "@/components/ui/chart"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
  }
>(({ config, className, children, ...props }, ref) => {
  const [activeChart, setActiveChart] = React.useState<keyof typeof config>()
  const id = React.useId()
  const CHART_ID = `chart-${id}`

  return (
    <ChartContext.Provider
      value={{
        config,
        activeChart,
        setActiveChart,
        chartId: CHART_ID,
      }}
    >
      <div
        data-chart={CHART_ID}
        className={cn(
          "group/chart flex aspect-video flex-col justify-between gap-4 data-[chart]:[--chart-padding:theme(spacing.4)] sm:data-[chart]:[--chart-padding:theme(spacing.6)]",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

type ChartContextProps = {
  config: ChartConfig
  chartId: string
  activeChart: keyof ChartConfig | undefined
  setActiveChart: React.Dispatch<
    React.SetStateAction<keyof ChartConfig | undefined>
  >
}

type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<LegendProps, "payload" | "verticalAlign"> & {
      name?: keyof ChartConfig
    }
>(({ className, payload, verticalAlign, name }, ref) => {
  const { config, setActiveChart } = useChart()

  // Manually handle events to support custom icons.
  const onEnter = React.useCallback(
    (item: (typeof payload)[number]) => {
      setActiveChart(item.dataKey as keyof typeof config)
    },
    [config, setActiveChart]
  )
  const onLeave = React.useCallback(() => {
    setActiveChart(undefined)
  }, [setActiveChart])

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground",
        verticalAlign === "top" ? "pb-4" : "pt-4",
        className
      )}
    >
      {payload?.map((item) => {
        const key = `${name || item.dataKey}` as keyof typeof config
        const itemConfig = config[key]

        return (
          <button
            key={item.value}
            data-active={item.inactive ? "false" : "true"}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs transition-colors data-[active=false]:text-muted-foreground/50 data-[active=false]:hover:text-muted-foreground"
            )}
            onMouseEnter={() => onEnter(item)}
            onMouseLeave={onLeave}
          >
            {itemConfig?.icon ? (
              <itemConfig.icon
                className="h-3 w-3"
                style={
                  {
                    color: item.color,
                  } as React.CSSProperties
                }
              />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label || item.value}
          </button>
        )
      })}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

const ChartStyle = React.forwardRef<
  HTMLStyleElement,
  React.ComponentProps<"style"> & { id: string }
>(({ id, ...props }, ref) => {
  const { config, activeChart } = useChart()

  const CSS = React.useMemo(() => {
    const inactive =
      "[&>*:not(.recharts-active)]:opacity-30 [&>*:not(.recharts-active)]:saturate-50"

    return `
[data-chart=${id}] .recharts-bar-rect,
[data-chart=${id}] .recharts-line-curve,
[data-chart=${id}] .recharts-area-path,
[data-chart=${id}] .recharts-sector,
[data-chart=${id}] .recharts-scatter-symbol,
[data-chart=${id}] .recharts-radial-bar-background-sector {
  transition: opacity 0.2s ease-in-out;
}
${
  activeChart
    ? `
  [data-chart=${id}] .recharts-bar:not([data-id=${activeChart}]) .recharts-bar-rect,
  [data-chart=${id}] .recharts-line:not([data-id=${activeChart}]) .recharts-line-curve,
  [data-chart=${id}] .recharts-area:not([data-id=${activeChart}]) .recharts-area-path,
  [data-chart=${id}] .recharts-pie:not([data-id=${activeChart}]) .recharts-sector,
  [data-chart=${id}] .recharts-scatter:not([data-id=${activeChart}]) .recharts-scatter-symbol,
  [data-chart=${id}] .recharts-radial-bar:not([data-id=${activeChart}]) .recharts-radial-bar-background-sector {
    opacity: 0.3;
    filter: saturate(0.5);
  }
`
    : `
  [data-chart=${id}] .recharts-bar-group:hover .recharts-bar-rect:not(:hover),
  [data-chart=${id}] .recharts-line-group:hover .recharts-line-curve:not(:hover),
  [data-chart=${id}] .recharts-area-group:hover .recharts-area-path:not(:hover),
  [data-chart=${id}] .recharts-pie-group:hover .recharts-sector:not(:hover),
  [data-chart=${id}] .recharts-scatter-group:hover .recharts-scatter-symbol:not(:hover),
  [data-chart=${id}] .recharts-radial-bar-group:hover .recharts-radial-bar-background-sector:not(:hover) {
    opacity: 0.3;
    filter: saturate(0.5);
  }
  `
}


${Object.entries(config)
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.color ?? `hsl(var(--chart-${Number(key.split("-")[1])}))`
    return `
  [data-chart=${id}] [data-id=${key}] {
    --color-primary: ${color};
  }
`
  })
  .join("\n")}

`
  }, [id, config, activeChart])

  return <style ref={ref} dangerouslySetInnerHTML={{ __html: CSS }} {...props} />
})
ChartStyle.displayName = "ChartStyle"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartStyle,
  type ChartTooltipContentProps,
  type ChartConfig,
}
