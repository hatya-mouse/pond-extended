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

export default function PageHeader({
    darkMode = false,
    onSave = () => {},
    onLoad = () => {},
    onInfo = () => {},
}: {
    darkMode?: boolean;
    onSave?: () => void;
    onLoad?: () => void;
    onInfo?: () => void;
}) {
    return (
        <div
            className={clsx(
                "page-header",
                darkMode && "dark",
                "gap-2",
                "flex items-center justify-between",
                "select-none",
            )}
        >
            <div className="flex gap-2">
                <IconButton
                    className="fa-solid fa-floppy-disk"
                    tooltip="Save"
                    onClick={onSave}
                />
                <IconButton
                    className="fa-solid fa-file-import"
                    tooltip="Load"
                    onClick={onLoad}
                />
            </div>

            <p className="font-bold flex-grow text-center">Pond Extended</p>

            <div className="flex gap-2">
                <IconButton
                    className="fa-solid fa-circle-info"
                    tooltip="Info"
                    onClick={onInfo}
                />
            </div>
        </div>
    );
}
