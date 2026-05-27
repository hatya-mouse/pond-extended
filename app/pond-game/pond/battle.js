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

import * as Pond from "@pond-core/pond";
import * as Utils from "@pond-game/utils/utils";

/** List of events to be visualized. */
export var events = [];
/** List of missiles in flight. */
export var missiles = [];
/** Time for cannon to be reloaded. */
export var reload_time = 1;
/** List of already dead ducks. */
export var deadDucks = [];
/** Ordered list of duck with the best duck first. */
var rank = [];
/** Speed of missiles. */
var missile_speed = 3;
/** Rate of acceleration. */
var duckAccel = 5;
/** Statements per frame. */
var statementsPerFrame = 100;
/** Speed of ducks' movement. */
var duckSpeed = 1;
/** Center to center distance for ducks to collide. */
var collisionRadius = 7;
/** Damage from worst-case collision. */
export var collisionDamage = 3;
/** PID of executing task. */
var pid = 0;
/** Time to end the battle, in milliseconds. */
var endTime = 0;
/** Time limit of the battle, in milliseconds. */
var timeLimit = 60 * 60 * 1000;
/** Callback function called when the battle is over. */
var doneCallback_ = 0;
/** Current interpreter processing duck. */
var currentDuck = 0;
/** Pond game settings. */
var settings_ = {};

/** Initialize the battle. */
export function init(settings) {
    settings_ = settings;
}

/** Reset the field. */
export function reset(settings) {
    // Get the settings.
    settings_ = settings;
    // Reset the battle.
    clearTimeout(pid);
    events = [];
    missiles = [];
    deadDucks = [];
    rank = [];
    for (const duck of Pond.ducks) {
        duck.reset();
    }
}

/** Start the battle. */
export function start(doneCallback) {
    doneCallback_ = doneCallback;
    endTime = Date.now() + timeLimit;
    for (const duck of Pond.ducks) {
        try {
            duck.initInterpreter();
        } catch (e) {
            Utils.errorLog(duck, " fails to load: ", e);
            duck.die();
        }
    }
    update();
}

/** Update the frame. Called every frames. */
function update() {
    // Update the interpreter.
    updateInterpreters();
    // Update the missile states.
    updateMissiles();
    // Update the duck states.
    updateDucks();
    if (Pond.ducks.length <= deadDucks.length + 1) {
        endTime = Math.min(endTime, Date.now() + 1000);
    }
    if (Date.now() > endTime) {
        stop();
    } else {
        // Do it all again in the moment.
        pid = setTimeout(update, 1000 / settings_.game.tps);
    }
}

/** Just pause the game. */
export function pause() {
    clearTimeout(pid);
}

function stop() {
    clearTimeout(pid);
    // Add the survivors to the ranks based on their damage.
    const survivors = [];
    for (const duck of Pond.ducks) {
        if (!duck.dead) {
            survivors.push(duck);
        }
    }
    const survivorCount = survivors.length;
    survivors.sort((a, b) => {
        return a.damage - b.damage;
    });
    while (survivors.length) {
        rank.unshift(survivors.pop());
    }
    // Fire done callback.
    if (doneCallback_) doneCallback_(survivorCount);
}

/** Update missiles' states. */
function updateMissiles() {
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        missile.progress += missile_speed;
        let maxDamage = 0;
        if (missile.range - missile.progress < missile_speed / 2) {
            // Boom.
            missiles.splice(i, 1);
            // Damage any duck in range.
            for (const duck of Pond.ducks) {
                if (duck.dead) {
                    continue;
                }
                const range = Utils.math.getDistance(
                    duck.loc.x,
                    duck.loc.y,
                    missile.endLoc.x,
                    missile.endLoc.y,
                );
                const damage = (1 - range / 4) * 10;
                if (damage > 0) {
                    duck.addDamage(damage);
                    maxDamage = Math.max(maxDamage, damage);
                }
            }
            events.push({
                type: "BOOM",
                damage: maxDamage,
                x: missile.endLoc.x,
                y: missile.endLoc.y,
            });
        }
    }
}

/** Update ducks' states. */
function updateDucks() {
    // Loop around ducks.
    for (const duck of Pond.ducks) {
        if (duck.dead) {
            continue;
        }
        // Accelerate the duck's speed.
        if (duck.speed < duck.desiredSpeed) {
            duck.speed = Math.min(duck.speed + duckAccel, duck.desiredSpeed);
        } else if (duck.speed > duck.desiredSpeed) {
            duck.speed = Math.max(duck.speed - duckAccel, duck.desiredSpeed);
        }
        // Move.
        if (duck.speed > 0) {
            // Get the closest duck.
            const [, closestBefore] = closestNeighbour(duck);
            // Get the movement from the angle and the speed.
            const angleRadians = Utils.math.degToRad(duck.degree);
            const speed = (duck.speed / 100) * duckSpeed;
            const dx = Math.cos(angleRadians) * speed;
            const dy = Math.sin(angleRadians) * speed;
            // Move the duck.
            duck.loc.x += dx;
            duck.loc.y += dy;
            // Check if the duck hit the edge.
            if (
                duck.loc.x < 0 ||
                duck.loc.x > settings_.viewport.width ||
                duck.loc.y < 0 ||
                duck.loc.y > settings_.viewport.height
            ) {
                // Clamp the location of the duck.
                duck.loc.x = Utils.math.clamp(
                    duck.loc.x,
                    0,
                    settings_.viewport.width,
                );
                duck.loc.y = Utils.math.clamp(
                    duck.loc.y,
                    0,
                    settings_.viewport.height,
                );
                // Calculate and give damage to the duck.
                const damage = (duck.speed / 100) * collisionDamage;
                duck.addDamage(damage);
                // Set the speed to zero.
                duck.speed = 0;
                duck.desiredSpeed = 0;
                events.push({
                    type: "CRASH",
                    duck: duck,
                    damage: damage,
                });
            } else {
                const [neighbour, closestAfter] = closestNeighbour(duck);
                if (
                    closestAfter < collisionRadius &&
                    closestBefore > closestAfter
                ) {
                    // Collision with another duck.
                    // Move to the position before.
                    duck.loc.x -= dx;
                    duck.loc.y -= dy;
                    // Calculate and give damage to the duck.
                    const damage =
                        (Math.max(duck.speed, neighbour.speed) / 100) *
                        collisionDamage;
                    duck.addDamage(damage);
                    // Stop the duck.
                    duck.speed = 0;
                    duck.desiredSpeed = 0;
                    // Add the damage to the neighbour.
                    neighbour.addDamage(damage);
                    // Stop the neighbour too.
                    neighbour.speed = 0;
                    neighbour.desiredSpeed = 0;
                    // Push the collision event.
                    events.push(
                        {
                            type: "CRASH",
                            duck: duck,
                            damage: damage,
                        },
                        {
                            type: "CRASH",
                            duck: neighbour,
                            damage: damage,
                        },
                    );
                }
            }
        }
    }
}

/** Update the Interpreters of each ducks. */
function updateInterpreters() {
    for (let i = 0; i < statementsPerFrame; i++) {
        for (const duck of Pond.ducks) {
            if (duck.dead) {
                continue;
            }
            currentDuck = duck;
            try {
                duck.interpreter.step();
            } catch (e) {
                Utils.errorLog(duck + " throws an error: " + e);
                duck.die();
            }
            currentDuck = null;
        }
    }
}

/**
 * Get the closest duck to the given duck.
 * @returns {[Duck, Number]} Returns the closest duck and the distance to it.
 */
function closestNeighbour(duck) {
    let closest = null;
    let distance = Infinity;
    for (const neighbour of Pond.ducks) {
        if (!neighbour.dead && duck !== neighbour) {
            const thisDistance = Math.min(
                distance,
                Utils.math.getDistance(
                    duck.loc.x,
                    duck.loc.y,
                    neighbour.loc.x,
                    neighbour.loc.y,
                ),
            );
            if (thisDistance < distance) {
                distance = thisDistance;
                closest = neighbour;
            }
        }
    }
    return [closest, distance];
}

export var initInterpreter = (interpreter, globalObject) => {
    let log = (value) => {
        Utils.log(`${currentDuck.name} logs: ${Number(value)}`);
    };
    wrap("log", log);

    let scan = (degree, resolution) => {
        return currentDuck.scan(degree, resolution);
    };
    wrap("scan", scan);

    let cannon = (degree, range) => {
        return currentDuck.cannon(degree, range);
    };
    wrap("cannon", cannon);

    let drive = (degree, speed) => {
        currentDuck.drive(degree, speed);
    };
    wrap("drive", drive);
    wrap("swim", drive);

    let stop = () => {
        currentDuck.speed = 0;
        currentDuck.disiredSpeed = 0;
    };
    wrap("stop", stop);

    var damage = () => {
        return currentDuck.damage;
    };
    wrap("damage", damage);

    var health = () => {
        return 100 - currentDuck.damage;
    };
    wrap("health", health);

    var speed = () => {
        return currentDuck.speed;
    };
    wrap("speed", speed);

    var getX = () => {
        return currentDuck.loc.x;
    };
    wrap("loc_x", getX);
    wrap("getX", getX);

    var getY = () => {
        return currentDuck.loc.y;
    };
    wrap("loc_y", getY);
    wrap("getY", getY);

    function wrap(name, func) {
        interpreter.setProperty(
            globalObject,
            name,
            interpreter.createNativeFunction(func, false),
        );
    }

    var myMath = interpreter.getProperty(globalObject, "Math");
    if (myMath) {
        let sin_deg = (v) => {
            return Math.sin(Utils.math.degToRad(v));
        };
        wrapMath("sin_deg", sin_deg);

        let cos_deg = (v) => {
            return Math.cos(Utils.math.degToRad(v));
        };
        wrapMath("cos_deg", cos_deg);

        let tan_deg = (v) => {
            return Math.tan(Utils.math.degToRad(v));
        };
        wrapMath("tan_deg", tan_deg);

        let asin_deg = (v) => {
            return Utils.math.radToDeg(Math.asin(v));
        };
        wrapMath("asin_deg", asin_deg);

        let acos_deg = (v) => {
            return Utils.math.radToDeg(Math.acos(v));
        };
        wrapMath("acos_deg", acos_deg);

        let atan_deg = (v) => {
            return Utils.math.radToDeg(Math.atan(v));
        };
        wrapMath("atan_deg", atan_deg);
    }

    function wrapMath(name, func) {
        interpreter.setProperty(
            myMath,
            name,
            interpreter.createNativeFunction(func, false),
        );
    }
};
