"use client";

import React from "react";

interface SafariProps {
    url?: string;
    className?: string;
    children?: React.ReactNode;
    imageSrc?: string;
    width?: number;
    height?: number;
}

export function Safari({
    url = "fitnessfive.com",
    className = "",
    children,
    imageSrc,
    width = 1203,
    height = 753,
    ...props
}: SafariProps) {
    return (
        <div className={`safari-frame ${className}`} {...props}>
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
            >
                {/* Background */}
                <rect
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                    rx="12"
                    fill="#1C1C1E"
                />

                {/* Top bar background */}
                <rect x="0" y="0" width={width} height="52" rx="12" fill="#2C2C2E" />
                <rect x="0" y="12" width={width} height="40" fill="#2C2C2E" />

                {/* Traffic lights */}
                <circle cx="27" cy="26" r="6" fill="#FF5F57" />
                <circle cx="47" cy="26" r="6" fill="#FEBC2E" />
                <circle cx="67" cy="26" r="6" fill="#28C840" />

                {/* URL bar */}
                <rect
                    x="286"
                    y="12"
                    width={width - 572}
                    height="28"
                    rx="6"
                    fill="#1C1C1E"
                />

                {/* URL text */}
                <text
                    x={width / 2}
                    y="30"
                    textAnchor="middle"
                    fill="#8E8E93"
                    fontSize="12"
                    fontFamily="system-ui, -apple-system, sans-serif"
                >
                    {url}
                </text>

                {/* Lock icon */}
                <svg x="275" y="18" width="12" height="16" viewBox="0 0 12 16">
                    <path
                        d="M6 0C3.79 0 2 1.79 2 4v2H1c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1H10V4c0-2.21-1.79-4-4-4zm2 6H4V4c0-1.1.9-2 2-2s2 .9 2 2v2z"
                        fill="#8E8E93"
                    />
                </svg>

                {/* Content area */}
                <foreignObject x="0" y="52" width={width} height={height - 52}>
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            background: "#09090b",
                            borderRadius: "0 0 12px 12px",
                        }}
                    >
                        {children ||
                            (imageSrc && (
                                <img
                                    src={imageSrc}
                                    alt="Safari content"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        objectPosition: "top",
                                    }}
                                />
                            ))}
                    </div>
                </foreignObject>
            </svg>
        </div>
    );
}
