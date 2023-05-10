
class NoiseProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super(options);
    }

    process(inputs, outputs, params) {
        for (let channel = 0; channel < outputs.length; ++channel) {
            for (let i = 0; i < outputs[0][channel].length; i++) {
                outputs[0][channel][i] = ((Math.random() * 2) - 1);
            }
        }

        return true;
    }

}

registerProcessor('noise-processor', NoiseProcessor);