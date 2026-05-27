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

"use client";

// React imports
import { useCallback, useEffect, useState, useMemo } from "react";
// Utils
import * as PondDataLoader from "@utils/pondDataLoader";
import { PondSettings, DuckData } from "@app/types/pond.types";
// UI Elements
import PondGame from "@pond-game/pondGame";
import SettingsView from "@pond/settingsView";
import PageHeader from "@pond/pageHeader";
import Editor from "@pond/editor";
import CreditView from "@pond/creditView";

export default function Home() {
    // Memoize initial settings to prevent recreation on each render
    const initialSettings = useMemo(() => new PondSettings(), []);

    const [activeView, setActiveView] = useState("editor");
    const [isDarkmode, setMode] = useState(false);
    // The latest settings.
    const [settings, setSettings] = useState<PondSettings>(initialSettings);
    // The settings which is currently used in the game.
    const [inGameSettings, setInGameSettings] =
        useState<PondSettings>(initialSettings);
    // Scripts
    const [selectedDuckData, setSelectedDuckData] = useState<DuckData>(
        settings.ducks[0],
    );
    // Credit visible
    const [isCreditVisible, setCreditVisible] = useState(false);

    // Memoize the dark mode media query
    const darkModeQuery = useMemo(
        () =>
            typeof window !== "undefined"
                ? window.matchMedia("(prefers-color-scheme: dark)")
                : null,
        [],
    );

    // Dark mode effect
    useEffect(() => {
        if (!darkModeQuery) return;

        setMode(darkModeQuery.matches);

        const handleChange = (event: MediaQueryListEvent) => {
            setMode(event.matches);
        };

        darkModeQuery.addEventListener("change", handleChange);
        return () => darkModeQuery.removeEventListener("change", handleChange);
    }, [darkModeQuery]);

    // Babel loader effect
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/@babel/standalone/babel.min.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const getDuckDataFromId = useCallback(
        (id: number): DuckData | undefined => {
            return settings.ducks.filter((duck) => duck.id === id)[0];
        },
        [settings.ducks],
    );

    const selectDuck = useCallback(
        (id: number) => {
            const duck = getDuckDataFromId(id);
            if (duck) setSelectedDuckData(duck);
            else console.error(`Duck selection failed. Duck id: ${id}`);
        },
        [getDuckDataFromId],
    );

    const updateSettings = useCallback(
        (newSettings: PondSettings) => {
            // Clone the settings.
            newSettings = structuredClone(newSettings);
            // Set the settings.
            setSettings(newSettings);

            setTimeout(() => {
                // Set the selected duck.
                let duckId = selectedDuckData.id;
                // If old selected duck doesn't exist, select the first one.
                const isIdExist =
                    newSettings.ducks.filter((duck) => duck.id === duckId)
                        .length > 0;
                if (!isIdExist) {
                    // Get the first item from ducks array.
                    const firstKey = newSettings.ducks[0].id;
                    duckId = firstKey;
                }
                // Select the duck.
                selectDuck(duckId);
            }, 0);
        },
        [selectedDuckData.id, selectDuck],
    );

    const onDocChange = useCallback((newDocument: string, duck: DuckData) => {
        duck.script = newDocument;
    }, []);

    const handleUpdateInGameSettings = useCallback(() => {
        setInGameSettings(settings);
    }, [settings]);

    const handleSaveBattle = useCallback(() => {
        const exportData = {
            settings: settings,
        };
        // Stringify the settings and the settings to a json data.
        const jsonData = JSON.stringify(exportData);
        setTimeout(() => {
            // Create an data blob.
            const blob = new Blob([jsonData], { type: "text/json" });
            // Download the data.
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "pond_data.json";
            a.click();
        }, 0);
    }, [settings]);

    const handleLoadBattle = useCallback(() => {
        // Create an file input element, and click it.
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        // Set the click callback.
        input.onchange = async () => {
            // Exit if no file is selected.
            if (!input.files || input.files.length === 0) return;
            // Get the first file.
            const file = input.files[0];
            // Get the data.
            const jsonData = await file.text();

            try {
                // Load the data using PondDataLoader.
                const data = PondDataLoader.load(jsonData);

                // Open the code of the first duck in the editor.
                setSelectedDuckData(data.settings.ducks[0]);
                // Get the settings.
                updateSettings(data.settings);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    alert(
                        `Failed to load the battle data. Error: ${error.message}`,
                    );
                }
            }
        };
        // Click the input.
        input.click();
    }, [updateSettings]);

    const handleShowCredits = useCallback(() => {
        setCreditVisible((prevValue: boolean) => !prevValue);
    }, []);

    return (
        <div className={isDarkmode ? "dark" : ""}>
            <PageHeader
                darkMode={isDarkmode}
                onSave={handleSaveBattle}
                onLoad={handleLoadBattle}
                onInfo={handleShowCredits}
            />
            <div className={`flex gap-2 p-2`}>
                <PondGame
                    settings={settings}
                    inGameSettings={inGameSettings}
                    selectedDuck={selectedDuckData}
                    onDuckSelect={selectDuck}
                    onUpdateInGameSettings={handleUpdateInGameSettings}
                />
                {/* Pass the setter function of "doc" to the Editor element. */}
                <Editor
                    className={`grow ${activeView === "settings" && "hidden"}`}
                    settings={settings}
                    setDoc={onDocChange}
                    onToggleView={setActiveView}
                    darkMode={isDarkmode}
                    selectedDuckData={selectedDuckData}
                />
                <SettingsView
                    className={`grow ${activeView === "editor" && "hidden"}`}
                    onToggleView={setActiveView}
                    darkMode={isDarkmode}
                    settings={settings}
                    onChangeSettings={updateSettings}
                />
            </div>
            <div id="overlays"></div>
            {isCreditVisible && (
                <CreditView
                    onHide={() => setCreditVisible(false)}
                    darkMode={isDarkmode}
                />
            )}
        </div>
    );
}
