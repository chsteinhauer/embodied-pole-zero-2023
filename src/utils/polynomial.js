/*
 * Copyright (c) 2020 Joseph Rabinoff
 * All rights reserved
 *
 * This file is part of linalg.js.
 *
 * linalg.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * linalg.js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with linalg.js.  If not, see <https://www.gnu.org/licenses/>.
 */

'use strict';

/** @module polynomial
 *
 * @file
 * A class for polynomial manipulations.
 */

import Complex from './complex.js';
import { range } from "./utils.js";

//console.log(Complex);

// Convenience
const C = (a, b=0) => new Complex(a, b);

/**
 * @summary
 * Data type holding roots of a polynomial with multiplicity.
 *
 * @desc
 * Roots are counted with multiplicity: `[x, m]` indicates a root of a
 * polynomial at the (Complex or real) number `x` with multiplicity `m`.  A Root
 * can also be a simple number or Complex number, which is taken to have
 * multiplicity equal to 1.
 *
 * @typedef {(number|Complex|Array)} Root
 */

/**
 * @summary
 * Class representing a polynomial.
 *
 * @desc
 * A polynomial is stored as an Array of coefficients `[an, ..., a1, a0]` which
 * represents the polynomial `an x^n + ... + a1 x + a0` in the variable `x`.
 * Polynomials can be added and scaled like Vectors, but can also be multiplied
 * and evaluated at a number.
 *
 * Do not use the constructor directly; instead use the convenience routine
 * {@link Polynomial.create}.
 *
 * @example {@lang javascript}
 * Polynomial.create(1, 2, 1).toString(1); // "x^2 + 2.0 x + 1.0"
 *
 * @extends Array
 */
class Polynomial extends Array {
 

    /**
     * @summary
     * Create a monic Polynomial with the given roots.
     *
     * @desc
     * Given roots `λ1, λ2, ..., λn`, this returns the polynomial that factors
     * as `(x-λ1)(x-λ2)...(x-λn)`.  Roots are assumed to be provided in
     * complex-conjugate pairs; the complex part of the product is dropped.
     *
     * @example {@lang javascript}
     * Polynomial.fromRoots(1, -1).toString(1);    // x^2 - 1.0
     * Polynomial.fromRoots([1, 3]).toString(1);   // x^3 - 3.0 x^2 + 3.0 x - 1.0
     * Polynomial.fromRoots(1, Complex.i, Complex.i.conj()).toString(1);
     *    // x^3 - 1.0 x^2 + 1.0 x - 1.0
     *
     * @param {...Root} roots - The roots of the resulting polynomial.
     * @return {Polynomial} The monic polynomial with the given roots.
     */
    static fromRoots(...roots) {
        let P = [C(1)];
        let n = 1;
        roots = roots.flatMap(
            r => r instanceof Complex ? [r]
                : r instanceof Array ? Array.from(range(r[1]), () => C(r[0]))
                : [r]);
        while(roots.length > 0) {
            let c = roots.pop();
            P.forEach((a, i) => a.mult(c).scale(-1).add((i < n-1 ? P[i+1] : 0)));
            P.unshift(C(1));
            n++;
        }
        return Polynomial.from(P, x => x.Re);
    }

}

export default Polynomial;