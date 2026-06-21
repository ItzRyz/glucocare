"use client"

import React from "react"
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TimelineItem {
    date: string
    count: number
    pending: number
    sent: number
}

interface CategoryItem {
    name: string
    count: number
    color: string
}

interface DashboardChartsProps {
    timelineData: TimelineItem[]
    categoryData: CategoryItem[]
}

const timelineConfig: ChartConfig = {
    count: {
        label: "Total Schedules",
        color: "var(--primary)",
    },
    pending: {
        label: "Pending",
        color: "#f59e0b",
    },
    sent: {
        label: "Sent",
        color: "#10b981",
    },
}

const categoryConfig: ChartConfig = {
    count: {
        label: "Schedules",
        color: "var(--primary)",
    },
}

export function DashboardCharts({ timelineData, categoryData }: DashboardChartsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Timeline Area Chart */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Weekly Schedule Timeline
                    </CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Activity trend for the next 7 days
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ChartContainer config={timelineConfig} className="h-full w-full">
                        <AreaChart
                            data={timelineData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200/50 dark:stroke-zinc-800/50" />
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                className="fill-zinc-500 dark:fill-zinc-400"
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                className="fill-zinc-500 dark:fill-zinc-400"
                                allowDecimals={false}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="var(--primary)"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="pending"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPending)"
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Category Bar Chart */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Category Distribution
                    </CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Schedules grouped by category
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {categoryData.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                            No data available
                        </div>
                    ) : (
                        <ChartContainer config={categoryConfig} className="h-full w-full">
                            <BarChart
                                data={categoryData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200/50 dark:stroke-zinc-800/50" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    className="fill-zinc-500 dark:fill-zinc-400"
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    className="fill-zinc-500 dark:fill-zinc-400"
                                    allowDecimals={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Bar
                                    dataKey="count"
                                    fill="var(--primary)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={48}
                                >
                                    {categoryData.map((entry, index) => (
                                        <rect
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
