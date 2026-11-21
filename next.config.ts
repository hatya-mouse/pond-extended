import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
    webpack: (config) => {
        config.resolve.alias["@codemirror/state"] = path.resolve(
            __dirname,
            "node_modules/@codemirror/state",
        );
        return config;
    },
    turbopack: {
        resolveAlias: {
            "@codemirror/state": "./node_modules/@codemirror/state",
        },
    }
};

export default nextConfig;

module.exports = {
    allowedDevOrigins: ['127.0.2.2'],
};

