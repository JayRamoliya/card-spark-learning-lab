
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface LineChartProps {
  data: any[];
  categories: string[];
  colors?: string[];
  index?: string;
  yAxisWidth?: number;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
}

export function LineChart({
  data,
  categories,
  colors = ["#8B5CF6", "#4ADE80"],
  index = "name",
  yAxisWidth = 40,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  valueFormatter = (value: number) => `${value}`,
}: LineChartProps) {
  return (
    <ChartContainer 
      className="w-full h-full"
      config={{}}
    >
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        {showXAxis && <XAxis dataKey={index} />}
        {showYAxis && <YAxis width={yAxisWidth} tickFormatter={valueFormatter} />}
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <Tooltip 
          formatter={(value: number) => [valueFormatter(value), ""]}
          labelFormatter={(label) => `Day ${label}`}
        />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}
