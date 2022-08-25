import { tryFirst } from "./utils.js";

describe("utils", () => {
    it("tryFirst should work", function() {
        const calls: unknown[][] = [];

        const th = () => { throw new Error(); };
        const ret = (...args: unknown[]) => {
            calls.push(args);
            return 5;
        };
        const three = (...args: unknown[]) => {
            calls.push(args);
            return 3;
        };

        const result = tryFirst("test", [th, th, ret]);
        result.must.equal(5);

        calls.must.eql([
            ["test"],
        ]);

        const result2 = tryFirst(["test"], [th, th, ret, three]);
        result2.must.equal(5);

        calls.must.eql([
            ["test"],
            ["test"],
        ]);

        const result3 = tryFirst(["test", "good"], [three, th, ret, ret, th, ret]);
        result3.must.equal(3);

        calls.must.eql([
            ["test"],
            ["test"],
            ["test", "good"],
        ]);
    });
});
