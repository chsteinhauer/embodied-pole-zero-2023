import url from "./audio-processor.js?url";
import noise_url from "./noise-processor.js?url";
import { State } from "./state";

const nodes = {
    context: null, 
    source: null,
    worklet: null,
    analyser: null,
}

export const Player = {
    nodes,

    start() {
        this.nodes.context.resume();
        State.isPlaying = true;
    },

    pause() {
        State.isPlaying = false;
        this.nodes.context.suspend();
    },
    
    async setupContext(ctx, src) {
        const analyser = ctx.createAnalyser();

        // Prepare nodes for audio processing
        await ctx.audioWorklet.addModule(url);
        const worklet = new AudioWorkletNode(ctx, 'audio-processor');
        worklet.disconnect();
        
        worklet.connect(analyser);
        analyser.connect(ctx.destination);
        ctx.suspend();

        this.nodes.context = ctx;
        this.nodes.source = src;
        this.nodes.worklet = worklet;
        this.nodes.analyser = analyser;

        State.buffer = new Uint8Array(analyser.frequencyBinCount);
        State.analyser = analyser;
    },

    async setupMediaContext(file) {
        const ctx = getAudioContext();
        const src = ctx.createBufferSource();

        await this.setupContext(ctx, src);

        console.log(file);

        src.buffer = await ctx.decodeAudioData(await file.arrayBuffer());

        src.connect(this.nodes.worklet);
        src.start();
        ctx.resume();
    },

    async setupNoiseContext() {
        const ctx = getAudioContext();
        const src = ctx.createConstantSource();

        await this.setupContext(ctx, src);
        await ctx.audioWorklet.addModule(noise_url);
        const noise = new AudioWorkletNode(ctx, 'noise-processor');

        src.connect(noise);
        noise.connect(this.nodes.worklet);
        src.start();
        ctx.resume();
    },

    updateParameter(a_coeffs, b_coeffs) {
        this.nodes.worklet.port.postMessage({
            a_coeffs, b_coeffs,
        });
    },
}

