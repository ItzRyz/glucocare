"use client";

import { Link, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

interface UpcomingSchedulesProps {
    upcomingSchedules: {
        id: string;
        title: string;
        description: string | null;
        remindAt: Date;
        category: {
            name: string;
        };
        type: {
            name: string;
        };
    }[];
}

export function UpcomingSchedules({ upcomingSchedules }: UpcomingSchedulesProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Jadwal Mendatang Terdekat
                    </CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Daftar pengingat antrean teratas yang akan segera dikirim.
                    </CardDescription>
                </div>
                <Link href="/dashboard/schedules">
                    <Button variant="outline" size="sm" className="gap-2">
                        Lihat Semua <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {upcomingSchedules.length === 0 ? (
                    <div className="text-center py-10 border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-400 text-sm">
                        Tidak ada pengingat pending dalam antrean saat ini.
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {upcomingSchedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className="flex items-center justify-between py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 px-2 rounded-lg transition-colors"
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        {schedule.title}
                                    </div>
                                    {schedule.description && (
                                        <div className="text-xs text-zinc-400 dark:text-zinc-500 max-w-[400px] truncate">
                                            {schedule.description}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                                        {schedule.category.name}
                                    </span>
                                    <div className="text-right">
                                        <div className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100">
                                            {format(new Date(schedule.remindAt), "Pp")}
                                        </div>
                                        <div className="text-[10px] text-zinc-400">
                                            Siklus: {schedule.type.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}