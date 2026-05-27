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

import clsx from "clsx";
import IconButton from "../components/iconButton";

export default function ControlBar({
    onStart,
    onPause,
    onReset,
    isPaused = false,
}: {
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    isPaused?: boolean;
}) {
    return (
        <div className="float-container control-bar">
            <IconButton
                className={clsx("fa-solid", isPaused ? "fa-play" : "fa-pause")}
                tooltip={isPaused ? "Start" : "Pause"}
                onClick={() => {
                    if (isPaused) onStart();
                    else onPause();
                }}
            />
            <IconButton
                className="fa-solid fa-rotate-left"
                tooltip="Reset"
                onClick={() => {
                    onReset();
                }}
            />
        </div>
    );
}
