//
// Copyright 2025-2026 Shuntaro Kasatani
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { PondSettings } from "@app/types/pond.types";

/**
 * Type definition for the pond game data structure.
 * Contains settings and scripts for the game.
 */
type PondData = {
    settings: PondSettings;
};

/**
 * Validates the settings object to ensure it matches PondSettings type.
 * @param settings - The settings object to validate
 * @returns True if the settings object is valid, false otherwise
 */
function validateSettings(settings: unknown): settings is PondSettings {
    if (!settings || typeof settings !== "object") return false;

    // Type assertion with type predicate for type-safe property access
    const s = settings as Partial<PondSettings>;

    // Validate game settings
    if (!s.game || typeof s.game !== "object") return false;
    if (typeof s.game.fps !== "number" || s.game.fps <= 0) return false;
    if (typeof s.game.tps !== "number" || s.game.tps <= 0) return false;
    if (
        typeof s.game.volume !== "number" ||
        s.game.volume < 0 ||
        s.game.volume > 1
    )
        return false;

    // Validate viewport settings
    if (!s.viewport || typeof s.viewport !== "object") return false;
    if (typeof s.viewport.width !== "number" || s.viewport.width <= 0)
        return false;
    if (typeof s.viewport.height !== "number" || s.viewport.height <= 0)
        return false;
    if (typeof s.viewport.backgroundColor !== "string") return false;

    // Validate duck settings
    if (!s.duck || typeof s.duck !== "object") return false;
    if (typeof s.duck.billColor1 !== "string") return false;
    if (typeof s.duck.billColor2 !== "string") return false;
    if (typeof s.duck.circleColor !== "string") return false;
    if (typeof s.duck.outerEyeColor !== "string") return false;
    if (typeof s.duck.innerEyeColor !== "string") return false;

    // Validate editor settings
    if (!s.editor || typeof s.editor !== "object") return false;
    if (typeof s.editor.tabWidth !== "number" || s.editor.tabWidth <= 0)
        return false;

    // Validate ducks array
    if (!Array.isArray(s.ducks)) return false;

    // Validate each duck in the array
    return s.ducks.every((duck) => {
        if (!duck || typeof duck !== "object") return false;

        return (
            typeof duck.id === "number" &&
            typeof duck.name === "string" &&
            typeof duck.color === "string" &&
            typeof duck.script === "string" &&
            duck.loc &&
            typeof duck.loc === "object" &&
            typeof duck.loc.x === "number" &&
            typeof duck.loc.y === "number"
        );
    });
}

/**
 * Validates the entire pond data structure.
 * Checks both settings and scripts for validity.
 * @param data - The data object to validate
 * @returns True if the data structure is valid, false otherwise
 */
function validatePondData(data: unknown): data is PondData {
    if (!data || typeof data !== "object") {
        throw new Error("Data must be an object");
        return false;
    }

    // Type assertion with type predicate for type-safe property access
    const d = data as Partial<PondData>;
    // Check for settings.
    if (!validateSettings(d.settings)) {
        throw new Error("Invalid settings structure");
        return false;
    }
    // Return true if successful.
    return true;
}

/**
 * Loads and validates pond game data from a JSON string.
 * @param jsonData - The JSON string containing pond game data
 * @returns Validated PondData object
 * @throws Error if the JSON is invalid or the data structure is incorrect
 */
export const load = (jsonData: string): PondData => {
    let data: unknown;

    // Parse the document.
    try {
        data = JSON.parse(jsonData);
    } catch (error) {
        throw error;
    }

    // Validate the parsed data.
    try {
        if (!validatePondData(data)) {
            throw new Error("Invalid data structure");
        }
    } catch (error) {
        throw error;
    }

    return data;
};
