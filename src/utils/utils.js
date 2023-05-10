import { H_OUT, State, W_OUT } from '../components/state';
import { create, all } from 'mathjs'

const config = { }
const math = create(all, config)


export function response(a_coeffs, b_coeffs) {
    if (!a_coeffs.length) return;
    const _a = a_coeffs.slice(); //a_coeffs.map((a) => math.complex(a.x,a.y));
    const _b = b_coeffs.slice(); //b_coeffs.map((b) => math.complex(b.x,b.y));

    const freqs = State.freq;

    State.res = [];
    let i = 0;
    for (const f of freqs) {
        const r_a = evalCoeffs(_a, f);
        const r_b = evalCoeffs(_b, f);
        State.res[i++] = math.divide(r_b, r_a).re;
    }

}

function evalCoeffs(coeffs, freq) {
	var len = coeffs.length;
	var res = 0;
	for (var i = 0; i < len; i++) {
		res = math.add(res, math.multiply(coeffs[i], math.exp(math.complex(0, -i * freq * 2 * math.pi))));
    }

	return res
}

export function mappings(values) {
    if (!values.length) return [];

    const x1 = - 1 - W_OUT;
    const x2 = 1 + W_OUT;

    const y1 = 1 + H_OUT;
    const y2 = - 1 - H_OUT;

    return values.map((v) => {
        return {
            x: map(v.x, 0, 1, x2, x1),
            y: map(v.y, 0, 1, y1, y2),
        }
    });
}


export function* range(a, b, step = 1) {
    let min, max;
    if(b === undefined)
        [min, max] = [0, a];
    else
        [min, max] = [a, b];
    if(step < 0)
        [min, max] = [max, min];
    for(let i = min; i < max; i += step)
        yield i;
}
