import type { NextConfig } from "next";

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

