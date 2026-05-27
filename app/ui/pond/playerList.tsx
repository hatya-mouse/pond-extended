//
// Copyright 2025 Shuntaro Kasatani
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

// Module Import
import clsx from "clsx";
// Pond Game Imports
import Duck from "@app/types/duck";
import { PondSettings } from "@app/types/pond.types";

export default function PlayerList({
    ducks,
    latestSettings,
    onSelectDuck = () => {},
}: {
    ducks: Duck[];
    /**
     * Latest settings used to check the diff between
     * current the in-game ducks and the latest settings ducks.
     */
    latestSettings: PondSettings;
    /**
     * Called when the duck is selected.
     * @param {number} _ ID of the selected duck, not index.
     */
    onSelectDuck?: (_: number) => void;
}) {
    return (
        <div className="float-container">
            {ducks.map((duck, index) => (
                <div
                    className={clsx(
                        "player-list-item",
                        index < ducks.length - 1 && "list-border-bottom",
                        index % 2 > 0 && "bg-opacity-5 bg-gray-500",
                    )}
                    key={duck.id}
                    onMouseDown={() => onSelectDuck(duck.id)}
                >
                    {/* Health bar */}
                    <div
                        className="overflow-visible"
                        style={{
                            backgroundColor: duck.colour,
                            width: `${100 - duck.damage}%`,
                        }}
                    >
                        <div
                            className={clsx(
                                "p-1 px-2 whitespace-nowrap",
                                "player-list-item-text",
                                duck.dead ? "text-red-400" : "text-white",
                            )}
                        >
                            {/* Show duck's name */}
                            {duck.name}
                            {latestSettings.ducks.filter(
                                (data) => data.id === duck.id,
                            ).length === 0 && (
                                <div className="text-gray-200">Removed</div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
