"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import type { PlayerStats } from "@/types";

interface RadarStatsChartProps {
    stats: PlayerStats;
    className?: string;
}

export function RadarStatsChart({ stats, className }: RadarStatsChartProps) {
    const data = [
        { attribute: "Consistency", value: stats.consistency, fullMark: 100 },
        { attribute: "Volume", value: stats.volume, fullMark: 100 },
        { attribute: "Frequency", value: stats.frequency, fullMark: 100 },
        { attribute: "Experience", value: stats.experience, fullMark: 100 },
    ];

    return (
        <div className={className} style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid
                        stroke="#3f3f46"
                        strokeWidth={1}
                        gridType="polygon"
                    />
                    <PolarAngleAxis
                        dataKey="attribute"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        tickLine={false}
                    />
                    <Radar
                        name="Stats"
                        dataKey="value"
                        stroke="#10b981"
                        fill="url(#radarGradient)"
                        fillOpacity={0.5}
                        strokeWidth={2}
                    />
                    <defs>
                        <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
