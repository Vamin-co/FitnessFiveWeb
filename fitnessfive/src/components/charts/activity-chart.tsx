"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ActivityChartProps {
    data: { date: string; calories: number; minutes: number }[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 shadow-xl">
                <p className="text-xs font-medium text-zinc-400">{label}</p>
                <p className="text-sm text-cyan-400">{payload[0].value} cal</p>
            </div>
        );
    }
    return null;
};

export function ActivityChart({ data }: ActivityChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="h-full w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#71717a", fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={32}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.calories > 0 ? "#06b6d4" : "#27272a"}
                                fillOpacity={entry.calories > 0 ? 0.8 : 1}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
