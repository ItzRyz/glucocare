"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockData = [
  { date: "Mon", level: 110 },
  { date: "Tue", level: 115 },
  { date: "Wed", level: 105 },
  { date: "Thu", level: 120 },
  { date: "Fri", level: 112 },
  { date: "Sat", level: 108 },
  { date: "Sun", level: 110 },
]

export default function BloodSugarChart() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Blood Sugar Trends</CardTitle>
        <CardDescription>Your fasting blood sugar levels over the past week.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="level" 
                stroke="var(--color-blue-600)" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "white", stroke: "var(--color-blue-600)" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
