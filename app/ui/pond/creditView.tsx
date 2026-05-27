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

// Link
import Link from "next/link";
// CLSX
import clsx from "clsx";
// Components
import IconButton from "../components/iconButton";

export default function CreditView({
    onHide,
    darkMode = false,
}: {
    onHide?: () => void;
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
                    <p className="font-bold">Credits</p>
                    <IconButton
                        className="fa-solid fa-xmark"
                        onClick={onHide}
                    />
                </div>
                <div className="flex-row gap-2 p-2">
                    <Link
                        className="font-bold"
                        href="https://github.com/Hatya-mouse/pond-extended"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Pond Extended
                    </Link>
                    <p>
                        Developed by{" "}
                        <Link
                            href="https://github.com/Hatya-mouse"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Shuntaro Kasatani
                        </Link>
                        .
                    </p>
                    <p>
                        Based on{" "}
                        <Link
                            href="https://blockly.games/pond-duck"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Blockly Games - Pond
                        </Link>{" "}
                        developed by Google.
                    </p>
                    <p>
                        <Link
                            href="https://github.com/google/blockly-games"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Original source code
                        </Link>{" "}
                        of Blockly Games is available under the{" "}
                        <Link
                            href="http://www.apache.org/licenses/LICENSE-2.0"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Apache-2.0 License
                        </Link>
                        .
                    </p>

                    <p className="font-bold">SFX</p>
                    <ul>
                        <li>
                            <Link href="https://freesound.org/people/soundscalpel.com/sounds/110393/">
                                water_splash.wav
                            </Link>{" "}
                            by{" "}
                            <Link href="https://freesound.org/people/soundscalpel.com/">
                                soundscalpel.com
                            </Link>{" "}
                            | License:{" "}
                            <Link href="http://creativecommons.org/licenses/by/3.0/">
                                Attribution 3.0
                            </Link>
                        </li>
                        <li>
                            <Link href="https://freesound.org/people/jorickhoofd/sounds/179265/">
                                Exploding lightbulb 1
                            </Link>{" "}
                            by{" "}
                            <Link href="https://freesound.org/people/jorickhoofd/">
                                jorickhoofd
                            </Link>{" "}
                            | License:{" "}
                            <Link href="https://creativecommons.org/licenses/by/4.0/">
                                Attribution 4.0
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="https://freesound.org/people/jorickhoofd/sounds/189158/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                First person face punch 2
                            </Link>{" "}
                            by{" "}
                            <Link
                                href="https://freesound.org/people/jorickhoofd/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                jorickhoofd
                            </Link>{" "}
                            | License:{" "}
                            <Link
                                href="https://creativecommons.org/licenses/by/4.0/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Attribution 4.0
                            </Link>
                        </li>
                    </ul>

                    <p className="font-bold">Icons</p>
                    <p>
                        This work includes icons from{" "}
                        <Link
                            href="https://fontawesome.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Font Awesome
                        </Link>
                        .
                    </p>
                    <a
                        href="https://www.producthunt.com/products/pond-extended?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-pond-extended"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            alt="Pond Extended - Simple duck fighting game for programming beginners | Product Hunt"
                            width="250"
                            height="54"
                            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1157085&amp;theme=neutral&amp;t=1779880415768"
                        />
                    </a>
                </div>
            </div>
        </div>
    );
}
