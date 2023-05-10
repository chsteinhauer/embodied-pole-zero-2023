
class AudioProcessor extends AudioWorkletProcessor {
    a_coeffs = [];
    b_coeffs = [];

    p_N = 20;
    p_input = [];
    p_output = [];

    constructor(options) {
        super(options);

        this.p_input = [new Array(this.p_N).fill(0), new Array(this.p_N).fill(0)];
        this.p_output = [new Array(this.p_N).fill(0), new Array(this.p_N).fill(0)];

        this.port.onmessage = (e) => {
            const { a_coeffs, b_coeffs } = e.data;

            this.a_coeffs = a_coeffs;
            this.b_coeffs = b_coeffs;
        };
    }

    process(inputs, outputs, params) {
        for (let channel = 0; channel < inputs.length; ++channel) {
            this.IIRFilter(inputs[0][channel], outputs[0][channel], channel)
        }

        return true;
    }

    IIRFilter(input, output, channel) {
        const s_len = 128;
        const f_len = this.a_coeffs.length;

        if (f_len > 0) {
            const s_index = this.p_N - f_len;
            const tmp_input = [...this.p_input[channel].slice(s_index, this.p_N), ...input];
            const tmp_output = [...this.p_output[channel].slice(s_index, this.p_N), ...output];

            for (let n = f_len; n < tmp_output.length; n++) {
                for (let k = 0; k < f_len; k++) {
                    output[n - f_len] += (this.b_coeffs[k] * tmp_input[n - k] - this.a_coeffs[k] * tmp_output[n - k - 1]);
                }
            }

        } else {
            for (let n = 0; n < s_len; n++) {
                output[n] = input[n];
            }
        }

        // Store last 20 samples of previous in- and outputs
        this.p_input[channel] = input.slice(s_len-this.p_N, s_len);
        this.p_output[channel] = output.slice(s_len-this.p_N, s_len);
    }

}

registerProcessor('audio-processor', AudioProcessor);