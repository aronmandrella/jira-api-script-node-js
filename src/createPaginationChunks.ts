export function createPaginationChunks(opts: { pageSize: number; total: number }) {
	const { pageSize, total } = opts;

	if (!Number.isSafeInteger(pageSize) || pageSize <= 0) {
		throw new TypeError(`Option 'pageSize' needs to be a positive safe integer.`);
	}
	if (!Number.isSafeInteger(total) || total < 0) {
		throw new TypeError(`Option 'total' needs to be a non-negative safe integer.`);
	}

	const pageCount = Math.ceil(total / pageSize);
	const lastPageSize = total - pageSize * (pageCount - 1);

	return Array.from({ length: pageCount }).map((value, index) => {
		return {
			startAt: index * pageSize,
			pageSize: index === pageCount - 1 ? lastPageSize : pageSize
		};
	});
}
