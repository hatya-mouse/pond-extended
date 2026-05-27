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

export default function ConfirmationModal({
    title = "",
    message = "",
    cancelText = "Cancel",
    confirmText = "Confirm",
    onConfirm = () => {},
    onCancel = () => {},
    darkMode = false,
}: {
    title?: string;
    message?: React.ReactNode;
    cancelText?: string;
    confirmText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    darkMode?: boolean;
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div
                className={clsx(
                    "float-container credit-view flex-row gap-2 m-4",
                    darkMode && "dark",
                )}
            >
                <div className="default-header gap-2">
                    <div className="font-bold">{title}</div>
                </div>
                <div className="flex-row gap-2 p-2">
                    <div className="mb-2">{message}</div>
                    <div className="flex gap-2">
                        <button className="text-button" onClick={onCancel}>
                            {cancelText}
                        </button>
                        <button className="text-button" onClick={onConfirm}>
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
