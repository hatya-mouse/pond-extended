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

// React
import { useCallback, useEffect, useRef, useMemo, useState } from "react";
// CodeMirror
import ReactCodeMirror from "@uiw/react-codemirror";
import { basicSetup } from "codemirror";
import {
    javascript,
    javascriptLanguage,
    esLint,
} from "@codemirror/lang-javascript";
import { scrollPastEnd } from "@codemirror/view";
import {
    CompletionContext,
    Completion,
    snippetCompletion as snip,
} from "@codemirror/autocomplete";
import { linter, lintGutter } from "@codemirror/lint";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import * as esLintBrowserify from "eslint-linter-browserify";
// Formatter WebWorker
import { FormatRequest, FormatResponse } from "@app/utils/editorDoWork";
// Pond Game
import { PondSettings, DuckData } from "@app/types/pond.types";
// Components
import IconButton from "@components/iconButton";

/** A list of completions. */
let completions: Completion[] = [];

const cmExtensions = [
    basicSetup,
    scrollPastEnd(),
    javascript(),
    lintGutter(),
    linter(
        esLint(new esLintBrowserify.Linter(), {
            // ESLint configurations.
            languageOptions: {
                parserOptions: {
                    ecmaVersion: "latest",
                    sourceType: "module",
                },
            },
        }),
    ),
    javascriptLanguage.data.of({
        autocomplete: pondCompletion,
    }),
];

if (typeof window !== "undefined") {
    // Check if we're running in the browser.
    // Initialize completions.
    initCompletions();
}

export default function Editor({
    className = "",
    settings,
    setDoc = () => {},
    onToggleView = () => {},
    darkMode = false,
    selectedDuckData,
}: {
    className?: string;
    settings: PondSettings;
    setDoc?: (doc: string, duck: DuckData) => void;
    onToggleView?: (_: string) => void;
    darkMode?: boolean;
    selectedDuckData: DuckData;
}) {
    const worker = useRef<Worker | undefined>(undefined);
    const [editorDoc, setEditorDoc] = useState(selectedDuckData.script);

    useEffect(() => {
        setEditorDoc(selectedDuckData.script);
    }, [selectedDuckData]);

    const onChange = useCallback(
        (val: string) => {
            setDoc(val, selectedDuckData);
            setEditorDoc(val); // Update editorDoc with the new value
        },
        [setDoc, selectedDuckData],
    );

    /** Format the script. */
    const formatScript = () => {
        // Post message to the worker.
        if (worker.current) {
            const request: FormatRequest = {
                order: "format",
                doc: selectedDuckData.script,
                tabWidth: settings.editor.tabWidth,
            };
            worker.current.postMessage(request);
        }
    };

    /** Called when the formatter WebWorker completes the formatting task. */
    const handleWorkerMessage = useCallback(
        (e: MessageEvent<FormatResponse>) => {
            const { doc } = e.data;
            setDoc(doc, selectedDuckData);
            setEditorDoc(doc); // Update editorDoc with the formatted document
        },
        [setDoc, selectedDuckData],
    );

    // Set up the WebWorker.
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            window.Worker &&
            typeof worker.current === "undefined"
        ) {
            worker.current = new Worker(
                new URL("@utils/editorDoWork", import.meta.url),
            );
            worker.current.onmessage = handleWorkerMessage;
        }
        return () => {
            if (worker.current) {
                worker.current.terminate();
                worker.current = undefined;
            }
            completions = [];
        };
    }, [handleWorkerMessage]);

    const memoizedExtensions = useMemo(() => cmExtensions, []);

    return (
        <div className={`${className} editor float-container`}>
            <div className="left-panel-header default-header select-none">
                <div className="flex gap-2">
                    <div
                        className="selected-duck-label"
                        style={{
                            backgroundColor: selectedDuckData.color,
                        }}
                    >
                        {selectedDuckData.name}
                    </div>
                </div>
                <div className="flex gap-2">
                    <IconButton
                        className="fa-solid fa-broom"
                        tooltip="Format Script"
                        onClick={formatScript}
                    />
                    <IconButton
                        className="fa-solid fa-gear"
                        tooltip="Open Settings"
                        onClick={() => onToggleView("settings")}
                    />
                </div>
            </div>
            <div className="editor-parent">
                {/* Optimize the editor rendering */}
                {settings.ducks.map((duck: DuckData) => {
                    if (duck.id !== selectedDuckData.id) return null;
                    return (
                        <ReactCodeMirror
                            key={duck.id}
                            className="visible will-change-contents"
                            value={editorDoc}
                            onChange={onChange}
                            extensions={memoizedExtensions}
                            theme={darkMode ? vscodeDark : vscodeLight}
                        />
                    );
                })}
            </div>
        </div>
    );
}

/** Define the pond API completions. */
function initCompletions() {
    // log() function
    addFunction(
        "log",
        ["value"],
        "Prints the number",
        "Prints the specified number to your browser's console.",
    );
    // scan() functions
    addFunction(
        "scan",
        ["angle"],
        "Activates the duck's radar",
        "Activates the duck's radar. This function returns the range to the nearest opponent in the specified direction. If there's no opponent in that direction, then Infinity is returned.",
        "scan(angle)",
    );
    addFunction(
        "scan",
        ["angle", "width"],
        "Activates the duck's radar with specified width",
        "Activates the duck's radar with specified width. This function returns the range to the nearest opponent in the specified direction. If there's no opponent in that direction, then Infinity is returned.",
        "scan(angle, width)",
    );
    // cannon() function
    addFunction(
        "cannon",
        ["angle", "range"],
        "Fires a cannnonball",
        "Fires a cannonball towards the specified angle and range. The cannon takes about one second to reload after firing.",
    );
    // Swimming functions
    addFunction(
        "drive",
        ["angle"],
        "Starts the duck moving",
        "Starts the duck moving. The duck will continue moving in the specified direction indefinitely.",
        "drive(angle)",
    );
    addFunction(
        "drive",
        ["angle", "speed"],
        "Starts the duck moving",
        "Starts the duck moving. The duck will continue moving in the specified direction indefinitely. The second (optional) parameter of swim() specifies the speed (0 - 100).",
        "drive(angle, speed)",
    );
    addFunction(
        "swim",
        ["angle"],
        "Starts the duck moving",
        "Starts the duck moving. The duck will continue moving in the specified direction indefinitely.",
        "swim(angle)",
    );
    addFunction(
        "swim",
        ["angle", "speed"],
        "Starts the duck moving",
        "Starts the duck moving. The duck will continue moving in the specified direction indefinitely. The second (optional) parameter of swim() specifies the speed (0 - 100).",
        "swim(angle, speed)",
    );
    // stop() function
    addFunction(
        "stop",
        [],
        "Stops the duck from moving",
        "stops the duck from moving. The duck will take a moment to slow down before stopping completely.",
    );
    // damage() functions
    addFunction(
        "damage",
        [],
        "Returns the duck's damage",
        "Retuns the duck's accumulative damage. Values are between 0 (perfect) and 100 (sunk). This is as same as calling 100 - health().",
    );
    addFunction(
        "health",
        [],
        "Returns the duck's health",
        "Returns the duck's current health level. Values are between 100 (perfect) and 0 (sunk).",
    );
    // speed() function
    addFunction(
        "speed",
        [],
        "Returns the duck's speed",
        "Returns the duck's current speed. Values are between 0 (stopped) and 100 (fast).",
    );
    // Position getter functions
    addFunction(
        "getX",
        [],
        "Returns the duck's x position",
        "Returns the duck's current horizontal position. Values are between 0 and 100, starting from the left edge.",
    );
    addFunction(
        "loc_X",
        [],
        "Returns the duck's x position",
        "Returns the duck's current horizontal position. Values are between 0 and 100, starting from the left edge.",
    );
    addFunction(
        "getY",
        [],
        "Returns the duck's y position",
        "Returns the duck's current vertical position. Values are between 0 and 100, starting from the bottom edge.",
    );
    addFunction(
        "loc_Y",
        [],
        "Returns the duck's y position",
        "Returns the duck's current vertical position. Values are between 0 and 100, starting from the bottom edge.",
    );
    // Custom math functions
    addFunction("sin_deg");
    addFunction("cos_deg");
    addFunction("tan_deg");
    addFunction("asin_deg");
    addFunction("acos_deg");
    addFunction("atan_deg");
}

/** Add a function to the completion list. */
function addFunction(
    name: string,
    args: string[] = [],
    detail: string = "",
    description: string = "",
    alterLabel: string | null = null,
) {
    let argString: string = "";
    for (const arg of args) {
        if (argString != "") {
            argString += ", ";
        }
        argString += "$" + `{${arg}}`;
    }
    if (!alterLabel) alterLabel = name;
    // Add a new completion.
    completions.push(
        snip(name + `(${argString})`, {
            label: alterLabel,
            type: "function",
            detail: detail,
            info: description,
        }),
    );
}

function pondCompletion(context: CompletionContext) {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return {
        from: word.from,
        options: completions,
    };
}
