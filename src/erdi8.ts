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


export class Erdi8 {
	private OFFSET = 8;
	private UNSAFE: string = "aeiou"

	private alph: string = "23456789abcdefghijkmnopqrstuvwxyz";


	public constructor(safe: boolean = false) {
		if (safe == true) {
			var tempAlph = "";
			for (var i = 0; i < this.alph.length; i++) {
				if (! (this.UNSAFE.indexOf(this.alph[i]) >= 0)) {
					tempAlph = tempAlph +  this.alph[i];
				}
			}
			//this.alph.split("").forEach((elem) => { if (!this.UNSAFE.split("").includes(elem)) { tempAlph = tempAlph + elem } });
			this.alph = tempAlph;
		}
	}

	public check(erdi8: string): boolean {
		if (erdi8.length == 0) {
			return true;
		}
		var flag = true;
		flag = ! (this.alph.substring(0, this.OFFSET).split("").indexOf(erdi8[0]) >= 0);
		//flag = !this.alph.substring(0, this.OFFSET).split("").includes(erdi8[0]);
		if (!flag) {
			console.error("Error: Not a valid erdi8 string, starts with " + erdi8[0]);
		}
		for (var i = 0; i < erdi8.length; i++) {
			if (! (this.alph.split("").indexOf(erdi8[i]) >= 0)) {
			//if (!this.alph.split("").includes(erdi8[i])) {
				flag = false;
				console.error("Error: Detected unknown character: " + erdi8[i] + "; allowed are the following: " + this.alph);
			}
		}
		return flag;
	}

	public increment(erdi8: string): string {
		if (!this.check(erdi8)) {
			return "";
		}
		var current = erdi8.split("");
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

	public decodeInt(erdi8: string): number {
		if (!this.check(erdi8)) {
			return 0;
		}
		var result = 0;
		var count = 0;
		while (erdi8.length > 0) {
			var tail = erdi8[erdi8.length - 1];
			erdi8 = erdi8.substring(0, erdi8.length - 1);
			var pos = this.alph.indexOf(tail) + 1;
			result = result + pos * Math.pow(this.alph.length, count) -
				this.OFFSET * Math.pow(this.alph.length, count);
			count = count + 1;
		}
		return result - 1;
	}

	public modSpace(length: number): Array<number> {
		var min = this.decodeInt(this.alph[this.alph.length - 1].repeat(length - 1)) + 1;
		var max = this.decodeInt(this.alph[this.alph.length - 1].repeat(length));
		var space = max - min + 1;
		return [min, max, space];
	}

	public encodeFourBytes(bytes: Uint8Array): string {
		if (bytes.length != 4) {
			console.error("Error: Input must be exactly four bytes long.");
			return "";
		} else {
			// type check
			for (var i = 0; i < bytes.length; i++) {
				if (!Number.isInteger(bytes[i]) && bytes[i] >= 0 && bytes[i] <= 255) {
					console.error("Error: Input must be an array of integers.");
					return "";
				}
			}
			var view = new DataView(bytes.buffer);
			return this.encodeInt(view.getUint32(0) + this.decodeInt("zzzzzz") + 1);
		}
	}

	// made this compatible to String.fromCharCode function --> returns number array
	public decodeFourBytes(erdi8: string): Array<number> {
		if (!this.check(erdi8)) {
			return new Array<number>();
		}
		if (erdi8.length == 7) {
			var view = new DataView(new ArrayBuffer(4));
			view.setUint32(0, this.decodeInt(erdi8) - this.decodeInt("zzzzzz") - 1);
			var result = new Array<number>();
			for (var i = 0; i < 4; i++) {
				result.push(view.getUint8(i));
			}
			return result;
		} else {
			console.error("Error: Input must be exactly seven characters long.");
			return new Array<number>();
		}
	}

	public incrementFancy(erdi8: string, stride: number): string {
		if (!this.check(erdi8)) {
			return "";
		}
		var modSpace = this.modSpace(erdi8.length);
		while (this.gcd(modSpace[0] + stride, modSpace[2]) != 1) {
			stride = stride + 1;
		}
		return this.encodeInt(modSpace[0] + (this.decodeInt(erdi8) + stride) % modSpace[2]);
	}

	public computeStride(erdi8: string, nextErdi8: string): Object {
		if (!this.check(erdi8) || !this.check(nextErdi8)) {
			return 0;
		}
		var modSpace = this.modSpace(erdi8.length);
		var inputInt = this.decodeInt(erdi8);
		var outputInt = this.decodeInt(nextErdi8);
		var result = outputInt - inputInt - modSpace[0];
		while (result < 0) {
			result = result + modSpace[2];
		}
		if (this.gcd(modSpace[0] + result, modSpace[2]) != 1) {
			console.error("Error: Stride is not coprime to the modulus space.");
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