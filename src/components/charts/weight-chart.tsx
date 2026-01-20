"use client";

import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface WeightChartProps {
    data: { date: string; weight: number }[];
}


const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 shadow-xl">
                <p className="text-xs text-zinc-400">{label}</p>
                <p className="text-lg font-semibold text-white">{payload[0].value} lbs</p>
            </div>
        );
    }
    return null;
};

export function WeightChart({ data }: WeightChartProps) {
    const formattedData = data.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
    }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="h-full w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#71717a", fontSize: 11 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#71717a", fontSize: 11 }}
                        domain={["dataMin - 5", "dataMax + 5"]}
                        width={40}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
                    <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#weightGradient)"
                        dot={{ fill: "#10b981", strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, fill: "#34d399", strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
