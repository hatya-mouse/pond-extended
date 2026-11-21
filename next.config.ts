import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    allowedDevOrigins: ["127.0.2.2"],
    webpack: (config) => {
        config.resolve.alias["@codemirror/state"] = path.resolve(
            process.cwd(),
            "node_modules/@codemirror/state",
        );
        return config;
    },
    turbopack: {
        resolveAlias: {
            "@codemirror/state": "./node_modules/@codemirror/state",
        },
    },
};

export default nextConfig;

