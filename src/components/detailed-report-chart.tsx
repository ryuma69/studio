'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface DetailedReportChartProps {
  data: {
    name: string;
    score: number;
  }[];
  onDownload: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DetailedReportChart({ data, onDownload }: DetailedReportChartProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Aptitude Breakdown</CardTitle>
          <CardDescription>A visual representation of your strengths.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onDownload} className="download-button-class">
            <Download className="h-5 w-5"/>
            <span className="sr-only">Download Report</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel indicator="dot" />}
              />
              <Pie
                data={data}
                dataKey="score"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
