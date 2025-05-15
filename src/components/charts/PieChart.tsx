
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PieChartProps {
  data: any[];
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
}

export function PieChart({
  data,
  category,
  index,
  colors = ["#8B5CF6", "#4ADE80", "#F59E0B", "#EF4444"],
  valueFormatter = (value: number) => `${value}`,
}: PieChartProps) {
  return (
    <ChartContainer 
      className="w-full h-full"
      config={{}}
    >
      <RechartsPieChart margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <Pie
          data={data}
          dataKey={category}
          nameKey={index}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          label={(entry) => entry[index]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [valueFormatter(value), ""]} />
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  );
}
