"use client";

import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface MetricsWidgetProps {
    total: number;
    pending: number;
    sent: number;
    failed: number;
}

export function MetricsWidget({ total, pending, sent, failed }: MetricsWidgetProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:scale-[1.02] transition-transform duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Total Pengingat
                    </CardTitle>
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400">
                        <Calendar className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{total}</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Semua jadwal yang terdaftar</p>
                </CardContent>
            </Card>

            <Card className="hover:scale-[1.02] transition-transform duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Menunggu (Pending)
                    </CardTitle>
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600 dark:text-amber-400">
                        <Clock className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{pending}</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Antrean yang akan datang</p>
                </CardContent>
            </Card>

            <Card className="hover:scale-[1.02] transition-transform duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Berhasil Dikirim
                    </CardTitle>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{sent}</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Pengingat selesai dikirim</p>
                </CardContent>
            </Card>

            <Card className="hover:scale-[1.02] transition-transform duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Gagal Dikirim
                    </CardTitle>
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-lg text-rose-600 dark:text-rose-400">
                        <XCircle className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{failed}</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Pengingat gagal dikirim</p>
                </CardContent>
            </Card>
        </div>
    )
}