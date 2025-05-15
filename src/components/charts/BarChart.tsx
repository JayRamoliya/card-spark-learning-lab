
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BarChartProps {
  data: any[];
  categories: string[];
  index?: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
}

export function BarChart({
  data,
  categories,
  index = "name",
  colors = ["#8B5CF6"],
  valueFormatter = (value: number) => `${value}`,
  showLegend = false,
}: BarChartProps) {
  return (
    <ChartContainer 
      className="w-full h-full"
      config={{}}
    >
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} />
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <Tooltip 
          formatter={(value: number) => [valueFormatter(value), ""]}
        />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Bar 
            key={category}
            dataKey={category}
            fill={colors[i % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}
