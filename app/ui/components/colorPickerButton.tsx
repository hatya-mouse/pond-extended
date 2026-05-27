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

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { SketchPicker, ColorResult } from "react-color";

export default function ColorPickerButton({
    className = "",
    width = "28px",
    color = "#000000",
    onChange = () => {},
    darkMode = false,
}: {
    className?: string;
    width?: string;
    color?: string;
    onChange?: (_: ColorResult) => void;
    darkMode?: boolean;
}) {
    const [isHidden, setHidden] = useState(true);
    const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
        null,
    );
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPortalContainer(document.getElementById("overlays"));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node)
            ) {
                setHidden(true);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleColorPickerClick = (event: React.MouseEvent) => {
        const button = event.currentTarget as HTMLElement;
        const rect = button.getBoundingClientRect();

        setPickerPosition({
            top: rect.bottom + window.scrollY + 5,
            left: rect.left + window.scrollX,
        });
        setHidden(false);
    };

    return (
        <>
            <button
                className={`colorpicker-button ${className}`}
                onClick={(e) => handleColorPickerClick(e)}
                style={{
                    backgroundColor: color,
                    width: width,
                }}
            ></button>
            {!isHidden &&
                portalContainer &&
                createPortal(
                    <div
                        ref={pickerRef}
                        className="colorpicker-container"
                        style={{
                            position: "fixed",
                            top: pickerPosition.top,
                            left: pickerPosition.left,
                            zIndex: 1000,
                        }}
                    >
                        <SketchPicker
                            color={color}
                            onChange={(color: ColorResult) => onChange(color)}
                            className={darkMode ? "dark" : ""}
                        />
                    </div>,
                    portalContainer,
                )}
        </>
    );
}
