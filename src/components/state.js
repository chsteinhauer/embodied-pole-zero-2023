import { mappings } from "../utils/utils";

export const T = [4, 8]; //[4,8,12,16,20];
export const W = 800 * 0.8;
export const H = 600 * 0.8;
export const R = (H - 100) / 2;
export const W_OUT = ((W - R*2 + 190)/W);
export const H_OUT = ((H - R*2 + 30)/H);


function setPoles(arr) {
    State.poles.splice(0, State.poles.length, ...arr);
    State.mappedPoles = mappings(arr);
}

function setZeros(arr) {
    State.zeros.splice(0, State.zeros.length, ...arr);
    State.mappedZeros = mappings(arr);
}

function reset(sampleRate) {
    const noctaves = 11;
    const nyquist = 0.5 * sampleRate;

    for (let i = 0; i < R; ++i) {
        let f = i / R;
        
        // Convert to log frequency scale (octaves).
        f = nyquist * Math.pow(2.0, noctaves * (f - 1.0));
        
        this.freq[i] = f;
    }
}

export const State = {
    poles: [],
    zeros: [],
    mappedPoles: [],
    mappedZeros: [],
    freq: new Float32Array(R),
    mag: new Float32Array(R),
    phase: new Float32Array(R),
    buffer: null,
    analyser: null,
    isPlaying: false,
    setPoles,
    setZeros,
}