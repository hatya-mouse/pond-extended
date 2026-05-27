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

// Module Imports
import { useState, useCallback, useMemo, useEffect } from "react";
import { ColorResult } from "react-color";
import clsx from "clsx";
// UI Elements
import IconButton from "@components/iconButton";
import ColorPickerButton from "@components/colorPickerButton";
// PondSettings class
import { PondSettings, DuckData } from "@app/types/pond.types";
import "@app/globals.css";
import ConfirmationModal from "@components/confirmationModal";

export default function SettingsView({
    className = "",
    onToggleView,
    darkMode = false,
    settings,
    onChangeSettings = () => {},
}: {
    className?: string;
    onToggleView: (_: string) => void;
    darkMode?: boolean;
    settings: PondSettings;
    onChangeSettings?: (_: PondSettings) => void;
}) {
    const [tempSettings, setTempSettings] = useState(() => new PondSettings());
    // Reset modal
    const [showResetModal, setShowResetModal] = useState(false);

    /** Change the specified property of tempSettings with debounce */
    const updateTemp = useCallback((key: string, value: unknown) => {
        setTempSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    /** Remove the duck - memoized */
    const removeDuck = useCallback((id: number) => {
        setTempSettings((prev) => ({
            ...prev,
            ducks: prev.ducks.filter((duck) => duck.id !== id),
        }));
    }, []);

    /** Add an duck - memoized */
    const appendDuck = useCallback(() => {
        setTempSettings((prev) => ({
            ...prev,
            ducks: [
                ...prev.ducks,
                new DuckData(
                    Date.now(),
                    `Duck ${prev.ducks.length + 1}`,
                    { x: 0, y: 0 },
                    "#ff9c00",
                    "",
                ),
            ],
        }));
    }, []);

    /** Update the duck's position - memoized */
    const updatePosition = useCallback(
        (id: number, axis: "x" | "y", value: number) => {
            if (!value) return;
            setTempSettings((prev) => ({
                ...prev,
                ducks: prev.ducks.map((duck) =>
                    duck.id === id
                        ? { ...duck, loc: { ...duck.loc, [axis]: value } }
                        : duck,
                ),
            }));
        },
        [],
    );

    /** Update the duck's name - memoized */
    const updateDuckName = useCallback((id: number, name: string) => {
        setTempSettings((prev) => ({
            ...prev,
            ducks: prev.ducks.map((duck) =>
                duck.id === id ? { ...duck, name } : duck,
            ),
        }));
    }, []);

    /** Update the duck's color - memoized */
    const updateDuckColor = useCallback((id: number, color: string) => {
        setTempSettings((prev) => ({
            ...prev,
            ducks: prev.ducks.map((duck) =>
                duck.id === id ? { ...duck, color } : duck,
            ),
        }));
    }, []);

    /** Reset to the default settings - memoized */
    const resetToDefault = useCallback(() => {
        setTempSettings(new PondSettings());
    }, []);

    /** Cancel changes - memoized */
    const cancelChanges = useCallback(() => {
        setTempSettings(settings);
    }, [settings]);

    /** Save changes - memoized */
    const saveChanges = useCallback(() => {
        onChangeSettings(tempSettings);
    }, [onChangeSettings, tempSettings]);

    /** Called when the toggle view button is pressed */
    const handleToggleView = useCallback(() => {
        cancelChanges();
        onToggleView("editor");
    }, [onToggleView, cancelChanges]);

    /** Utility function for clamp */
    const clamp = useCallback((v: number, min: number, max: number) => {
        return Math.max(Math.min(v, max), min);
    }, []);

    /** Check if we need to save */
    const hasToSave = useMemo(() => {
        return JSON.stringify(settings) !== JSON.stringify(tempSettings);
    }, [settings, tempSettings]);

    /** Called when settings has changed */
    useEffect(() => {
        setTempSettings(settings);
    }, [settings]);

    // Memoize the duck list to prevent unnecessary re-renders
    const duckList = useMemo(
        () =>
            tempSettings.ducks.map((duck, index) => (
                <div
                    className={clsx({
                        "duck-list-item": true,
                        "bg-opacity-5 bg-gray-500": index % 2 > 0,
                    })}
                    key={duck.id}
                >
                    {/* Remove button */}
                    <IconButton
                        className="fa-solid fa-minus"
                        disabled={tempSettings.ducks.length < 3}
                        tooltip={`Remove ${duck.name}`}
                        onClick={() => removeDuck(duck.id)}
                    />
                    {/* Color Picker button */}
                    <ColorPickerButton
                        color={duck.color}
                        onChange={(color: ColorResult) =>
                            updateDuckColor(duck.id, color.hex)
                        }
                        darkMode={darkMode}
                    />
                    {/* Name */}
                    <input
                        className="w-48"
                        type="text"
                        value={duck.name}
                        onChange={(e) =>
                            updateDuckName(duck.id, e.target.value)
                        }
                    />
                    {/* Position */}
                    <label>
                        X
                        <input
                            className="ml-2 w-48"
                            type="number"
                            value={duck.loc.x}
                            onChange={(e) =>
                                updatePosition(
                                    duck.id,
                                    "x",
                                    parseInt(e.target.value),
                                )
                            }
                            // Clamp the number when focus out.
                            onBlur={(e) =>
                                updatePosition(
                                    duck.id,
                                    "x",
                                    clamp(
                                        parseInt(
                                            e.target.value
                                                ? e.target.value
                                                : "0",
                                        ),
                                        parseInt(e.target.min),
                                        parseInt(e.target.max),
                                    ),
                                )
                            }
                            min="0"
                            max={tempSettings.viewport.width}
                        />
                    </label>
                    <label>
                        Y
                        <input
                            className="ml-2 mr-2 w-48"
                            type="number"
                            value={duck.loc.y}
                            onChange={(e) =>
                                updatePosition(
                                    duck.id,
                                    "y",
                                    parseInt(e.target.value),
                                )
                            }
                            // Clamp the number when focus out.
                            onBlur={(e) =>
                                updatePosition(
                                    duck.id,
                                    "y",
                                    clamp(
                                        parseInt(
                                            e.target.value
                                                ? e.target.value
                                                : "0",
                                        ),
                                        parseInt(e.target.min),
                                        parseInt(e.target.max),
                                    ),
                                )
                            }
                            min="0"
                            max={tempSettings.viewport.height}
                        />
                    </label>
                </div>
            )),
        [
            tempSettings.viewport,
            tempSettings.ducks,
            darkMode,
            clamp,
            removeDuck,
            updateDuckColor,
            updateDuckName,
            updatePosition,
        ],
    );

    return (
        <div className={`settings-view float-container ${className}`}>
            {/* Header */}
            <div className="left-panel-header default-header select-none">
                <div className="flex gap-2">Settings</div>
                <div className="flex gap-2">
                    <div
                        className={clsx(
                            "text-sm",
                            "leading-7",
                            "transition-opacity",
                            hasToSave ? "opacity-100" : "opacity-0",
                        )}
                    >
                        Changes are not saved
                    </div>
                    {/* Toggle view button */}
                    <IconButton
                        className="fa-solid fa-code left-header"
                        tooltip={hasToSave ? "" : "Show Editor"}
                        disabled={hasToSave}
                        onClick={handleToggleView}
                    />
                </div>
            </div>

            {/* Pond Game Settings */}
            <div className="settings-container">
                {/* Game settings */}
                <h1>Game</h1>
                {/* FPS */}
                <h2>FPS</h2>
                <p>Adjust the fps.</p>
                <label>
                    FPS
                    <input
                        className="ml-2 w-48"
                        type="number"
                        value={tempSettings.game.fps}
                        onChange={(e) =>
                            updateTemp("game", {
                                ...tempSettings.game,
                                fps: parseInt(
                                    e.target.value ? e.target.value : "0",
                                ),
                            })
                        }
                        // Clamp the number when focus out.
                        onBlur={(e) =>
                            updateTemp("game", {
                                ...tempSettings.game,
                                fps: clamp(
                                    parseInt(
                                        e.target.value ? e.target.value : "0",
                                    ),
                                    parseInt(e.target.min),
                                    parseInt(e.target.max),
                                ),
                            })
                        }
                        min="1"
                        max="500"
                    />
                </label>
                {/* Tick Speed */}
                <h2>Tick Speed</h2>
                <p>
                    Adjust the number of script executions per second. Higher
                    tick speed may impact performance.
                </p>
                <label>
                    Tick Speed
                    <input
                        className="ml-2 w-48"
                        type="number"
                        value={tempSettings.game.tps}
                        onChange={(e) =>
                            updateTemp("game", {
                                ...tempSettings.game,
                                tps: parseInt(
                                    e.target.value ? e.target.value : "0",
                                ),
                            })
                        }
                        // Clamp the number when focus out.
                        onBlur={(e) =>
                            updateTemp("game", {
                                ...tempSettings.game,
                                tps: clamp(
                                    parseInt(
                                        e.target.value ? e.target.value : "0",
                                    ),
                                    parseInt(e.target.min),
                                    parseInt(e.target.max),
                                ),
                            })
                        }
                        min="1"
                        max="500"
                    />
                </label>
                {/* SFX Volume */}
                <h2>Volume</h2>
                <p>Adjust the volume of sfx.</p>
                <label>
                    <input
                        className="w-52"
                        type="range"
                        value={tempSettings.game.volume * 100}
                        onChange={(e) =>
                            updateTemp("game", {
                                ...tempSettings.game,
                                volume:
                                    parseInt(
                                        e.target.value ? e.target.value : "0",
                                    ) / 100,
                            })
                        }
                        // Clamp the number when focus out.
                        onBlur={(e) =>
                            updateTemp("game", {
                                ...tempSettings.game,
                                volume: clamp(
                                    parseInt(
                                        e.target.value ? e.target.value : "0",
                                    ) / 100,
                                    0,
                                    1,
                                ),
                            })
                        }
                    />
                </label>

                {/* Viewport settings */}
                <h1>Viewport</h1>
                <h2>Viewport Size</h2>
                <p>Set the viewport&apos;s size.</p>
                {/* Viewport properties */}
                <div className="flex gap-3 flex-wrap">
                    <label>
                        Width
                        <input
                            className="ml-2 w-48"
                            type="number"
                            value={tempSettings.viewport.width}
                            onChange={(e) =>
                                updateTemp("viewport", {
                                    ...tempSettings.viewport,
                                    width: parseInt(
                                        e.target.value ? e.target.value : "0",
                                    ),
                                })
                            }
                            // Clamp the number when focus out.
                            onBlur={(e) =>
                                updateTemp("viewport", {
                                    ...tempSettings.viewport,
                                    width: clamp(
                                        parseInt(
                                            e.target.value
                                                ? e.target.value
                                                : "0",
                                        ),
                                        parseInt(e.target.min),
                                        parseInt(e.target.max),
                                    ),
                                })
                            }
                            min="50"
                            max="10000"
                        />
                    </label>
                    <label>
                        Height
                        <input
                            className="ml-2 w-48"
                            type="number"
                            value={tempSettings.viewport.height}
                            onChange={(e) =>
                                updateTemp("viewport", {
                                    ...tempSettings.viewport,
                                    height: parseInt(
                                        e.target.value ? e.target.value : "0",
                                    ),
                                })
                            }
                            // Clamp the number when focus out.
                            onBlur={(e) =>
                                updateTemp("viewport", {
                                    ...tempSettings.viewport,
                                    height: clamp(
                                        parseInt(
                                            e.target.value
                                                ? e.target.value
                                                : "0",
                                        ),
                                        parseInt(e.target.min),
                                        parseInt(e.target.max),
                                    ),
                                })
                            }
                            min="50"
                            max="10000"
                        />
                    </label>
                </div>
                {/* Backround color */}
                <h2>Background Color</h2>
                <p>Set the background color.</p>
                <div className="flex gap-2 flex-wrap leading-7">
                    Background Color
                    <ColorPickerButton
                        width="64px"
                        color={tempSettings.viewport.backgroundColor}
                        onChange={(color: ColorResult) =>
                            updateTemp("viewport", {
                                ...tempSettings.viewport,
                                backgroundColor: color.hex,
                            })
                        }
                        darkMode={darkMode}
                    />
                </div>

                {/* Duck settings */}
                <h1>Duck</h1>
                {/* Duck bill color for gradient */}
                <h2>Bill Color</h2>
                <div className="flex gap-2 flex-wrap leading-7">
                    Color 1
                    <ColorPickerButton
                        className="mr-1"
                        width="64px"
                        color={tempSettings.duck.billColor1}
                        onChange={(color: ColorResult) =>
                            updateTemp("duck", {
                                ...tempSettings.duck,
                                billColor1: color.hex,
                            })
                        }
                        darkMode={darkMode}
                    />
                    Color 2
                    <ColorPickerButton
                        width="64px"
                        color={tempSettings.duck.billColor2}
                        onChange={(color: ColorResult) =>
                            updateTemp("duck", {
                                ...tempSettings.duck,
                                billColor2: color.hex,
                            })
                        }
                        darkMode={darkMode}
                    />
                </div>
                <h2>Body Circle Color</h2>
                <ColorPickerButton
                    className="mr-1"
                    width="64px"
                    color={tempSettings.duck.circleColor}
                    onChange={(color: ColorResult) =>
                        updateTemp("duck", {
                            ...tempSettings.duck,
                            circleColor: color.hex,
                        })
                    }
                    darkMode={darkMode}
                />
                {/* Duck eye color */}
                <h2>Eye Color</h2>
                <div className="flex gap-2 flex-wrap leading-7">
                    Inner
                    <ColorPickerButton
                        className="mr-1"
                        width="64px"
                        color={tempSettings.duck.innerEyeColor}
                        onChange={(color: ColorResult) =>
                            updateTemp("duck", {
                                ...tempSettings.duck,
                                innerEyeColor: color.hex,
                            })
                        }
                        darkMode={darkMode}
                    />
                    Outer
                    <ColorPickerButton
                        width="64px"
                        color={tempSettings.duck.outerEyeColor}
                        onChange={(color: ColorResult) =>
                            updateTemp("duck", {
                                ...tempSettings.duck,
                                outerEyeColor: color.hex,
                            })
                        }
                        darkMode={darkMode}
                    />
                </div>
                {/* Duck list */}
                <h2>Edit Ducks</h2>
                <p>Add, edit or remove ducks.</p>
                {/* Editable duck list */}
                <div className="duck-list-container">
                    <div className="default-header">
                        {/* Add button */}
                        <IconButton
                            className="fa-solid fa-plus"
                            tooltip="Add Duck"
                            onClick={() => appendDuck()}
                        />
                    </div>
                    {/* Show Duck list */}
                    <div className="duck-list">{duckList}</div>
                </div>

                {/* Editor settings */}
                <h1>Editor</h1>
                <h2>Tab Width</h2>
                <p>Adjust the size of indent.</p>
                <label>
                    Tab Width
                    <input
                        className="ml-2 w-48"
                        type="number"
                        value={tempSettings.editor.tabWidth}
                        onChange={(e) =>
                            updateTemp("editor", {
                                ...tempSettings.editor,
                                tabWidth: parseInt(
                                    e.target.value ? e.target.value : "4",
                                ),
                            })
                        }
                    />
                </label>

                {/* Apply button */}
                <h2 className="mt-4">Save Settings</h2>
                <div className="flex gap-2">
                    <button
                        className="text-button"
                        onClick={() => setShowResetModal(true)}
                    >
                        Reset to Default
                    </button>
                    <button
                        className="text-button"
                        onClick={cancelChanges}
                        disabled={!hasToSave}
                    >
                        Cancel Changes
                    </button>
                    <button
                        className="text-button highlighted"
                        onClick={saveChanges}
                        disabled={!hasToSave}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
            {showResetModal && (
                <ConfirmationModal
                    title="Reset to Default"
                    message={
                        <>
                            <div>
                                Are you sure you want to reset all settings to
                                default?
                            </div>
                            <strong>
                                This will also reset every duck&apos;s script.
                            </strong>
                        </>
                    }
                    onConfirm={() => {
                        resetToDefault();
                        setShowResetModal(false);
                    }}
                    onCancel={() => setShowResetModal(false)}
                    darkMode={darkMode}
                />
            )}
        </div>
    );
}
