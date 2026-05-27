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

/** Array of html audio elements. */
const sounds = new Map<string, HTMLAudioElement>();
/** Volume multiply. */
let volume = 1.0;

/**
 * Load an audio file, cache it.
 * @param path Path to the audio file.
 * @param id Alias name of the sound.
 */
export function loadAudio(path: string, id: string) {
    const sound = new Audio(path);
    sounds.set(id, sound);
}

/**
 * Play the sound.
 * @param id Name of the sound you want to play.
 * @param volume Volume of the sound to play.
 */
export function playAudio(id: string, vol: number = 1.0) {
    const sound = sounds.get(id);
    if (!sound) {
        console.error("Sound not found.");
        return;
    }
    const newSound = sound.cloneNode(true) as HTMLAudioElement;
    newSound.volume = vol * volume;
    newSound.play();
}

/**
 * Adjust the base volume.
 * @param vol New volume (0.0 - 1.0).
 */
export function setVolume(vol: number) {
    volume = vol;
}
