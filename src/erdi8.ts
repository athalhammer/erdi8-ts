//    erdi8 - a unique identifier scheme and identifier generator and transformer that
//    operates on the base-36 alphabet without [0, 1, and l]
//
//    Copyright (C) 2023  Andreas Thalhammer
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <https://www.gnu.org/licenses/>.


class Erdi8 {
	private OFFSET = 8;
	private UNSAFE: string = "aeiou"

	private alph: string = "23456789abcdefghijkmnopqrstuvwxyz";
	private safe: boolean = false;


	public constructor(safe: boolean = false) {
		if (safe = true) {
			var tempAlph = "";
			this.alph.split("").forEach((elem) => { if (!this.UNSAFE.split("").includes(elem)) { tempAlph = tempAlph + elem } });
			this.alph = tempAlph;
			this.safe = true;
		}
	}

	public check(input: string): boolean {
		if (input.length == 0) {
			return true;
		}
		var flag = true;
		flag = !this.alph.substring(0, this.OFFSET).split("").includes(input[0]);
		if (!flag) {
			console.error("Error: Not a valid erdi8 string, starts with " + input[0]);
		}
		for (var i = 0; i < input.length; i++) {
			if (!this.alph.split("").includes(input[i])) {
				flag = false;
				console.error("Error: Detected unknown character: " + input[i] + "; allowed are the following: " + this.alph);
			}
		}
		return flag;
	}

	public increment(input: string): string {
		if (!this.check(input)) {
			return "";
		}
		var current = input.split("");
		var carry = true;
		var count = 1;
		while (carry == true) {

			var char = current[current.length - count];
			var pos = this.alph.indexOf(char) + 1;
			current[current.length - count] = this.alph[pos % this.alph.length];
			if (pos >= this.alph.length) {
				count = count + 1;
			} else {
				carry = false;
			}
			if (count > current.length) {
				current.unshift(this.alph[this.OFFSET - 1]);
			}
		}
		return current.join("");
	}

	public encodeInt(div: number): string {
		var result = "";
		var mod = div % this.alph.length;
		div = Math.floor(div / this.alph.length);
		if (mod + this.OFFSET >= this.alph.length) {
			div = div + 1;
		}
		mod = mod + this.OFFSET;
		while (div > 0) {
			div = div - 1;
			result = this.alph[mod % this.alph.length] + result;
			mod = div % this.alph.length;
			div = Math.floor(div / this.alph.length);
			if (mod + this.OFFSET >= this.alph.length) {
				div = div + 1;
			}
			mod = mod + this.OFFSET;
		}
		return this.alph[mod % this.alph.length] + result;
	}

	public gcd(a: number, b: number): number {
		if (b) {
			return this.gcd(b, a % b);
		} else {
			return Math.abs(a);
		}
	}

	public decodeInt(input: string): number {
		if (!this.check(input)) {
			return 0;
		}
		var result = 0;
		var count = 0;
		while (input.length > 0) {
			var tail = input[input.length - 1];
			input = input.substring(0, input.length - 1);
			var pos = this.alph.indexOf(tail) + 1;
			result = result + pos * Math.pow(this.alph.length, count) -
				this.OFFSET * Math.pow(this.alph.length, count);
			count = count + 1;
		}
		return result - 1;
	}

	public modSpace(input: number): Array<number> {
		var min = this.decodeInt(this.alph[this.alph.length - 1].repeat(input - 1)) + 1;
		var max = this.decodeInt(this.alph[this.alph.length - 1].repeat(input));
		var space = max - min + 1;
		return [min, max, space];
	}

	public incrementFancy(input: string, stride: number): string {
		if (!this.check(input)) {
			return "";
		}
		var modSpace = this.modSpace(input.length);
		while (this.gcd(modSpace[0] + stride, modSpace[2]) != 1) {
			stride = stride + 1;
		}
		return this.encodeInt(modSpace[0] + (this.decodeInt(input) + stride) % modSpace[2]);
	}

	public computeStride(input: string, output: string): Object {
		if (!this.check(input) || !this.check(output)) {
			return 0;
		}
		var modSpace = this.modSpace(input.length);
		var inputInt = this.decodeInt(input);
		var outputInt = this.decodeInt(output);
		var result = outputInt - inputInt - modSpace[0];
		while (result < 0) {
			result = result + modSpace[2];
		}
		if (this.gcd(modSpace[0] + result, modSpace[2]) != 1) {
			console.error("Error: No stride found");
			return 0;
		}
		var candidates = [];
		var stride = result - 1;
		while (this.gcd(modSpace[0] + stride, modSpace[2]) != 1) {
			candidates.push(stride);
			stride = stride - 1;
		}
		return { "stride_effective": result, "stride_other_candidates": candidates };
	}
}