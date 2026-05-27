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

import * as Battle from "@pond-core/battle.js";
import * as Visualization from "@pond-core/visualization.js";
import * as Transpile from "@pond-game/utils/transpile.js";
import Duck from "@app/types/duck";
import { PondSettings } from "@app/types/pond.types";

/** Settings instance. */
let settings_: PondSettings = new PondSettings();
/** List of ducks to be displayed. */
export let ducks: Duck[] = [];
/** Callback function called when some duck is taken a damage. */
let damageCallback_: ((_: Duck[]) => void) | undefined;
/** Callback function called when the battle ends. */
let gameEndCallback_: (() => void) | undefined;

export function init(
    canvas: HTMLCanvasElement,
    scratch: HTMLCanvasElement,
    settings: PondSettings,
    gameEndCallback: () => void,
    damageCallback?: (_: Duck[]) => void,
) {
    settings_ = settings;
    // Initialize the game.
    Battle.init(settings);
    Visualization.init(canvas, scratch, settings);
    // Set the callback function.
    damageCallback_ = damageCallback;
    gameEndCallback_ = gameEndCallback;
    // Update the duck info.
    updateDuckInfo();
}

/**
 * Reset the whole pond game.
 */
export function reset(settings: PondSettings) {
    settings_ = settings;
    // Remove all old ducks.
    ducks = [];
    // Add ducks.
    // Deep clone the duck data to avoid overwriting the settings by changing its property.
    for (let duck of settings.ducks) {
        duck = structuredClone(duck);
        ducks.push(
            new Duck(duck.id, duck.name, duck.loc, duck.color, updateDuckInfo),
        );
    }
    // Save all the scripts.
    saveDuckScripts();
    // Reset the game.
    Battle.reset(settings);
    Visualization.reset(settings);
    if (damageCallback_) damageCallback_(ducks);
    // Update the duck info.
    updateDuckInfo();
}

/**
 * Re-draw the whole scene.
 */
export function redraw() {
    Visualization.redraw();
}

/**
 * Executes the user's code... pray for us.
 */
export function start() {
    // Start the battle.
    Battle.start(endBattle);
    Visualization.start();
    // Update the duck info.
    updateDuckInfo();
}

/**
 * Pause the game.
 */
export function pause() {
    Battle.pause();
    console.log("Game paused.");
}

export function updateDuckInfo() {
    if (damageCallback_) damageCallback_(ducks);
}

/**
 * Highlight the specified duck.
 * @param id ID of the duck. Note that this is not an index of the array.
 */
export function highlightDuck(id: number) {
    Visualization.setHighlightedDuck(id);
}

function saveDuckScripts() {
    settings_.ducks.forEach((duck, idx) => {
        const compiled = Transpile.transpileToEs5(duck.script);
        ducks[idx].setCode(duck.script, compiled);
    });
}

function endBattle() {
    // Log that the battle is over.
    console.log("Battle is over!");
    if (gameEndCallback_) gameEndCallback_();
}
