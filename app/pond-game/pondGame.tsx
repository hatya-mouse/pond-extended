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
import { useEffect, useState, useCallback, useRef } from "react";
// Pond Game
import * as Pond from "@pond-game/pond/pond";
import Duck from "@app/types/duck";
// Settings type
import { DuckData, PondSettings } from "@app/types/pond.types";
// UI Elements
import ControlBar from "@pond/controlBar";
import PlayerList from "@pond/playerList";

export default function PondGame({
    settings,
    inGameSettings,
    selectedDuck,
    onDuckSelect,
    onUpdateInGameSettings,
}: {
    settings: PondSettings;
    inGameSettings: PondSettings;
    selectedDuck: DuckData;
    /**
     * Called when the duck is selected.
     * @param {number} _ ID of the selected duck, not index.
     */
    onDuckSelect: (_: number) => void;
    onUpdateInGameSettings: () => void;
}) {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [scratchCanvas, setScratchCanvas] =
        useState<HTMLCanvasElement | null>(null);
    // Canvas context.
    const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D | null>(
        null,
    );
    const [scratchCanvasCtx, setScratchCanvasCtx] =
        useState<CanvasRenderingContext2D | null>(null);
    // Canvas actual width and height.
    const [viewportSize, setViewportSize] = useState({
        width: 100,
        height: 100,
    });
    // Whether the game is started. (true even if the game is paused.
    const [started, setStarted] = useState(false);
    // Whether the game is paused.
    const [paused, setPaused] = useState(true);
    // Duck's current information including health.
    const [duckInfo, setDuckInfo] = useState<Duck[]>([]);
    // Whether initialized
    const hasInit = useRef<boolean>(false);

    const updateDuckInfo = (newDuckInfo: Duck[]) => {
        setDuckInfo([...newDuckInfo]);
    };

    const start = useCallback(() => {
        if (!started) {
            Pond.reset(settings);
        }
        // Start the game.
        Pond.start();
        // Set the flags.
        setStarted(true);
        setPaused(false);
        // Remove duck highlight.
        Pond.highlightDuck(NaN);
    }, [started, settings]);

    const pause = useCallback(() => {
        Pond.pause();
        // Set the paused flag.
        setPaused(true);
        // Highlight the selected duck.
        Pond.highlightDuck(selectedDuck.id);
    }, [selectedDuck]);

    const reset = useCallback(() => {
        // Reset the game.
        Pond.reset(settings);
        // Set the flags.
        setStarted(false);
        setPaused(true);
        // Highlight the selected duck.
        Pond.highlightDuck(selectedDuck.id);
    }, [settings, selectedDuck]);

    const onGameEnd = useCallback(() => {
        setStarted(false);
        setPaused(true);
        // Highlight the selected duck.
        Pond.highlightDuck(selectedDuck.id);
    }, [selectedDuck]);

    const handleDuckSelection = useCallback(
        (id: number) => {
            onDuckSelect(id);
            // Don't highlight the duck during the game.
            Pond.highlightDuck(paused ? id : NaN);
        },
        [paused, onDuckSelect],
    );

    const resizeCanvas = useCallback(() => {
        if (!canvas) return;

        // Canvas' actual width.
        const newWidth = canvas.clientWidth;
        const newHeight = canvas.clientHeight;

        requestAnimationFrame(() => {
            setViewportSize({ width: newWidth, height: newHeight });
            setTimeout(Pond.redraw, 50);
        });
    }, [canvas]);

    useEffect(() => {
        if (!canvas) return;
        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);
        return () => resizeObserver.disconnect();
    }, [canvas, resizeCanvas]);

    useEffect(() => {
        const viewport = document.getElementById(
            "viewport",
        ) as HTMLCanvasElement;
        setCanvasCtx(viewport.getContext("2d"));
        setCanvas(viewport);

        const scratch = document.getElementById("scratch") as HTMLCanvasElement;
        setScratchCanvasCtx(scratch.getContext("2d"));
        setScratchCanvas(scratch);
    }, []);

    useEffect(() => {
        if (canvas && scratchCanvas && canvasCtx && scratchCanvasCtx) {
            Pond.init(
                canvas,
                scratchCanvas,
                inGameSettings,
                onGameEnd,
                updateDuckInfo,
            );
        }
    }, [
        canvasCtx,
        scratchCanvasCtx,
        canvas,
        scratchCanvas,
        inGameSettings,
        onGameEnd,
    ]);

    useEffect(() => {
        if (!started && settings !== inGameSettings) {
            onUpdateInGameSettings();
            reset();
        }
    }, [settings, inGameSettings, started, onUpdateInGameSettings, reset]);

    if (!hasInit.current) {
        reset();
        hasInit.current = true;
    }

    return (
        <div className="left-area">
            <div className="flex flex-col gap-2 select-none">
                <canvas
                    id="scratch"
                    style={{ display: "none" }}
                    width={viewportSize.width}
                    height={viewportSize.height}
                ></canvas>
                <div className="float-container">
                    <canvas
                        id="viewport"
                        style={{
                            aspectRatio: `${inGameSettings.viewport.width} / ${inGameSettings.viewport.height}`,
                            width: "100%",
                            height: "auto",
                        }}
                        width={viewportSize.width}
                        height={viewportSize.height}
                    ></canvas>
                </div>
                <ControlBar
                    onStart={start}
                    onPause={pause}
                    onReset={reset}
                    isPaused={paused}
                />
                <PlayerList
                    ducks={duckInfo}
                    latestSettings={settings}
                    onSelectDuck={handleDuckSelection}
                />
            </div>
        </div>
    );
}
