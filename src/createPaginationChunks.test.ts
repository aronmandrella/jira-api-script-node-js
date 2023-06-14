import { describe, expect, it } from "@jest/globals";
import { createPaginationChunks } from "./createPaginationChunks";

describe("createPaginationChunks", () => {
	it("should throw an error if pageSize is not a positive safe integer", () => {
		expect(() => {
			createPaginationChunks({ pageSize: -10, total: 100 });
		}).toThrow(TypeError);
	});

	it("should throw an error if total is not a non-negative safe integer", () => {
		expect(() => {
			createPaginationChunks({ pageSize: 10, total: -100 });
		}).toThrow(TypeError);
	});

	it("should return the correct pagination chunks when all pages are not equally sized", () => {
		const chunks = createPaginationChunks({ pageSize: 10, total: 25 });
		expect(chunks).toHaveLength(3);
		expect(chunks[0]).toStrictEqual({ startAt: 0, pageSize: 10 });
		expect(chunks[1]).toStrictEqual({ startAt: 10, pageSize: 10 });
		expect(chunks[2]).toStrictEqual({ startAt: 20, pageSize: 5 });
	});

	it("should return the correct pagination chunks when all pages are equally sized", () => {
		const chunks = createPaginationChunks({ pageSize: 2, total: 8 });
		expect(chunks).toHaveLength(4);
		expect(chunks[0]).toStrictEqual({ startAt: 0, pageSize: 2 });
		expect(chunks[1]).toStrictEqual({ startAt: 2, pageSize: 2 });
		expect(chunks[2]).toStrictEqual({ startAt: 4, pageSize: 2 });
		expect(chunks[3]).toStrictEqual({ startAt: 6, pageSize: 2 });
	});
});
