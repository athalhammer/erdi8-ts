// unit tests for erdi8.ts

import { Erdi8 } from "../src/erdi8";
import * as fs from "fs";
import * as path from "path";

describe('testing erdi8 file', () => {
    test('check list of expected values', () => {
        var csv = fs.readFileSync(path.join(__dirname, "test.csv"), "utf8");
        //console.log(csv);
        var rows = csv.split("\n");
        //console.log(rows);
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
  });