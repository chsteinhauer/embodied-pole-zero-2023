import "p5js-wrapper";
import 'p5js-wrapper/sound';
import * as mph from "@mediapipe/hands";
import * as mpc from "@mediapipe/camera_utils";
import { H, State, T, W } from "./components/state";
import { _setup, _draw, _windowResized } from "./components/visualizer";
import { Player } from "./components/audio-player";
import Complex from "./utils/complex";
import Polynomial from "./utils/polynomial";

let hands, camera;


window.setup = async () => {
    const capture = createCapture(VIDEO);
    capture.size(W, H);
    capture.hide();

    const toggle = document.querySelector("#import");
    toggle.addEventListener("click", (e) => importFile());
    const noise = document.querySelector("#noise");
    noise.addEventListener("click", async (e) => await playNoise());

    hands = new mph.Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });
    hands.setOptions({
        smoothLandmarks: true,
        maxNumHands: 2,
        modelComplexity: 0.9,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });
    hands.onResults(onResults);

    camera = new mpc.Camera(capture.elt, {
        onFrame: async () => {
            await hands.send({ image: capture.elt });
        },
        width: W,
        height: H
    });

    camera.start();

    _setup(capture);
}

window.draw = () => {
    if (State.isPlaying && frameCount % 50) {
        const { a_coeffs, b_coeffs } = getCoefficients(State.mappedPoles, State.mappedZeros);

        Player.updateParameter(a_coeffs, b_coeffs);
    }

    _draw();
}

window.windowResized = () => {
    _windowResized();
}

function onResults(results) {
    State.poles = [];
    State.zeros = [];
    State.mappedPoles = [];
    State.mappedZeros = [];

    if (results.multiHandLandmarks) {
        const hands = results.multiHandedness.map((v) => v.label);

        for (let i = 0; i < hands.length; ++i) {
            const isPoles = hands[i] === "Right";
            const landmarks = results.multiHandLandmarks;

            if (isPoles) {
                State.setPoles(landmarks[i].filter((_,i) => T.includes(i)));
            } else {
                State.setZeros(landmarks[i].filter((_,i) => T.includes(i)));
            }
        }
    }
}

function importFile() {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = async _ => {
        let file = input.files[0];

        await Player.setupMediaContext(file);
        Player.start();
    };
    input.click();
}


async function playNoise() {
    await Player.setupNoiseContext();
    Player.start();
}

function getCoefficients(poles, zeros) {
    const p_roots = poles.map((p) => new Complex(p.x ,p.y));
    const z_roots = zeros.map((z) => new Complex(z.x ,z.y));

    const a_coeffs = p_roots.length ? Polynomial.fromRoots(...p_roots) : [];
    const b_coeffs = z_roots.length ? Polynomial.fromRoots(...z_roots) : [];

    let diff = abs(a_coeffs.length - b_coeffs.length);

    if (diff) {
        if (!a_coeffs.length) {
            a_coeffs.push(1);
            diff--;
        }
        if (!b_coeffs.length) {
            b_coeffs.push(1);
            diff--;
        }
        for (let i = 0; i < diff; i++) {
            a_coeffs.length < b_coeffs.length 
                ? a_coeffs.push(0)
                : b_coeffs.push(0); 
        }
    }

    return { a_coeffs, b_coeffs };
}
