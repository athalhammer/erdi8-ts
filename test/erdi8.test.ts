// unit tests for erdi8.ts

import { Erdi8 } from "../erdi8";
import * as fs from "fs";
import * as path from "path";

describe('testing erdi8', () => {
    test('check list of expected values', () => {
        var csv = fs.readFileSync(path.join(__dirname, "test.csv"), "utf8");
        var rows = csv.split("\n");
        var e8 = new Erdi8();

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var cols = row.split(",");
            var num = parseInt(cols[0]);
            var str = (cols[1]);


            var enc = e8.encodeInt(num);
            var dec = e8.decodeInt(str);
            expect(num).toBe(dec);
            expect(str).toBe(enc);
        }
    });

    test('check list of expected values for safe = True', () => {
        var csv = fs.readFileSync(path.join(__dirname, "test_safe.csv"), "utf8");
        var rows = csv.split("\n");
        var e8 = new Erdi8(true);

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var cols = row.split(",");
            var num = parseInt(cols[0]);
            var str = (cols[1]);


            var enc = e8.encodeInt(num);
            var dec = e8.decodeInt(str);
            expect(num).toBe(dec);
            expect(str).toBe(enc);
        }
    });

    test('split modspace', () => {
        var e8 = new Erdi8();
        var res = e8.splitFancySpace(4, 4, 4);
        expect(res).toEqual(["a222", "tkc3", "n5n4", "fox5"]);
    });
  });
