# mantine-react-table

## 10.0.0

### Major Changes

- a15bf55: Upgrade to TanStack Table v9 (`@tanstack/react-table` 9.3.1, `@tanstack/match-sorter-utils` 9.2.6).
  
  - TanStack packages are ESM-only; the MRT CommonJS build needs Node >= 20.19 (require(esm)) or a bundler. `engines.node` is now `>=20.19.0`.
  - Column pinning is logical: `columnPinning` state is `{ start, end }` (was `{ left, right }`); `column.pin('start' | 'end')`; `column.getIsPinned()` returns `'start' | 'end' | false`; `table.getLeft*`/`getRight*` and `row.getLeft/RightVisibleCells` are now `getStart*`/`getEnd*`. Pinned cells use `inset-inline-start/end`, so RTL tables pin correctly. DOM/CSS hooks renamed: `data-column-pinned="start|end"`, `data-last-start-pinned`, `data-first-end-pinned`, `--mrt-table-cell-start`, `--mrt-table-cell-end`.
  - Column resizing state renamed: `columnSizingInfo` -> `columnResizing`, `onColumnSizingInfoChange` -> `onColumnResizingChange`, `table.setColumnSizingInfo` -> `table.setColumnResizing`, `MRT_ColumnSizingInfoState` -> `MRT_ColumnResizingState` (old type name kept as a deprecated alias).
  - Sorting renamed: column option `sortingFn` -> `sortFn`, table option `sortingFns` -> `sortFns`, `MRT_SortingFns`/`MRT_SortingFn`/`MRT_SortingOption` -> `MRT_SortFns`/`MRT_SortFn`/`MRT_SortOption` (old names kept as deprecated aliases), `column.getSortingFn()`/`getAutoSortingFn()` -> `getSortFn()`/`getAutoSortFn()`.
  - Removed options `getCoreRowModel`, `getFilteredRowModel`, `getSortedRowModel`, `getPaginationRowModel`, `getExpandedRowModel`, `getGroupedRowModel`, `getFacetedRowModel`, `getFacetedMinMaxValues`, `getFacetedUniqueValues`. MRT registers all row models; override one (e.g. server-side faceting) with `coreRowModel`, `filteredRowModel`, `sortedRowModel`, `paginatedRowModel`, `expandedRowModel`, `groupedRowModel`, `facetedRowModel`, `facetedMinMaxValues`, `facetedUniqueValues` (read once on mount). `aggregationFns`, `filterFns` and `sortFns` are also read once on mount.
  - `table.getPaginationRowModel()`/`getPrePaginationRowModel()` -> `getPaginatedRowModel()`/`getPrePaginatedRowModel()`. `enablePagination: false` now always forces `manualPagination: true`.
  - Aggregation functions are definitions `{ aggregate(context), merge?(context) }` (`MRT_AggregationFnDef`); `MRT_AggregationFns.*` are no longer callable. The v8 callback `(columnId, leafRows, childRows)` still works but is deprecated. Arrays of aggregation functions still return a positional array. Built-in `count` now counts all data rows in nested groups; new built-ins `first`, `last`.
  - Row selection: `MRT_RowSelectionState` is `Record<string, true>`; `table.getIsSomeRowsSelected()`/`getIsSomePageRowsSelected()` are true whenever at least one row is selected. TanStack's Shift range selection in `row.getToggleSelectedHandler()` is off by default (`enableRowRangeSelection: false`); MRT's `enableBatchRowSelection` is unchanged.
  - Row, column, cell and header methods live on prototypes: don't spread (`{ ...row }`), destructure (`const { getValue } = row`) or serialize them.
  - `row.table`, `column.table`, `cell.getContext().table` and `header.getContext().table` are the TanStack table, not the MRT instance; use the `table` MRT passes to callbacks.
  - TanStack types take a features generic first (`Row<TFeatures, TData>`, ...). MRT types are unchanged; use the new `MRT_TableFeatures` type with TanStack types. Global `ColumnMeta`/`TableMeta` augmentations now take `TFeatures` as the first type parameter.
  - TanStack's `onStateChange`, `setState`, table-level `enablePinning` and all `_`-prefixed APIs are gone. `table.getState()` is still provided by MRT.

### Patch Changes

- 98975c6: First publish
- 98975c6: Second try to publish something.

## 9.0.5

### Patch Changes

- 98975c6: First publish
- 98975c6: Second try to publish something.

## 9.0.3

### Patch Changes

- Automated release triggered by push to main.

## 9.0.1

### Patch Changes

- Automated release triggered by push to main.

## 9.0.0

### Major Changes

- f908e33: Upgrade to Mantine 9, React 19, and Next.js 15. Breaking changes include updated peer dependency requirements.

## 8.0.4

### Patch Changes

- f908e33: Verify automated release pipeline.

## 8.0.3

### Patch Changes

- f908e33: Verify automated release pipeline.

## 8.0.2

### Patch Changes

- f908e33: Verify automated release pipeline.

## 8.0.1

### Patch Changes

- Verify automated release pipeline.
