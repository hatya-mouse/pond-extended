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

// Prettier
import * as prettier from "prettier/standalone";
import estree from "prettier/plugins/estree";
import meriyah from "prettier/plugins/meriyah";

export interface FormatRequest {
    order: "format";
    doc: string;
    tabWidth: number;
}

export interface FormatResponse {
    doc: string;
}

addEventListener("message", async (e: MessageEvent<FormatRequest>) => {
    const request = e.data;
    // To ignore other posted message.
    if (request.order !== "format") return;
    // Parse the document.
    const formatted = await prettier.format(request.doc, {
        parser: "meriyah",
        plugins: [meriyah, estree],
        tabWidth: request.tabWidth,
        trailingComma: "es5",
    });
    // Return the value via message.
    postMessage({
        doc: formatted,
    });
});
