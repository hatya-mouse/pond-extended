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

import { useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export default function IconButton({
    className = "",
    tooltip = "",
    disabled = false,
    onClick = () => {},
}: {
    className?: string;
    tooltip?: string;
    disabled?: boolean;
    onClick?: () => void;
}) {
    const [hover, setHover] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<{
        top: number;
        left: number;
    } | null>(null);

    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const top = rect.bottom;
        let left = rect.left;
        // Move the tooltip within the screen.
        left = Math.max(left, rect.left);
        if (left + rect.width > rect.right) left = rect.right;
        setTooltipPosition({
            top: top + window.scrollY,
            left: left + window.scrollX,
        });
        setHover(true);
    };

    const handleMouseLeave = () => {
        setHover(false);
    };

    // Show tooltip when mouse hovered.
    const tooltipElement =
        hover && tooltipPosition && tooltip
            ? createPortal(
                  <div
                      className="icon-button-tooltip tooltip-hover"
                      style={{
                          position: "absolute",
                          top: `${tooltipPosition.top + 3}px`,
                          left: `${tooltipPosition.left}px`,
                      }}
                  >
                      {tooltip}
                  </div>,
                  document.getElementById("overlays") as HTMLElement,
              )
            : null;

    return (
        <div className="relative cursor-pointer">
            <button
                className={clsx(
                    className,
                    "icon-button",
                    disabled && "disabled",
                )}
                onClick={() => {
                    if (!disabled) onClick();
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />
            {tooltipElement}
        </div>
    );
}
