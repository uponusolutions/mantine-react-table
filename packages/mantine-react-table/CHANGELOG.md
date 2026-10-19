# mantine-react-table

## 11.0.0

### Major Changes

- 4a9c8ab: Support consumers compiled with the React Compiler.
  
  - `useMantineReactTable` returns a new `table` object on every render of the component that calls it (it used to return one stable, mutated object). A compiled (or `memo`ized) `<MantineReactTable table={table} />` now re-renders when table state changes. TanStack's core instance inside stays stable.
  - `table.getState()` and `table.options` are snapshots of the render that produced that `table`. `table.refs` is a stable object, and its ref objects keep their identity. Plain state setters (`setDensity`, `setIsFullScreen`, ...) are stable; setters replaced by an `onXChange` option and `setCreatingRow` are not.
  - `initialState`, `columns` (including group columns) and `data` are no longer mutated, so frozen objects and constants shared between tables work. `getPrePaginatedRowModel().rows` is no longer sorted in place when ranking global filter results.
  - `memoMode: 'table-body'` now re-renders the body when `data` changes (the comparator used to compare the stable instance with itself).
  - Detail panels open again: rows are expandable by default when `renderDetailPanel` is set (TanStack v9 refuses to expand rows that cannot expand). Pass `getRowCanExpand` to override.
  - Migration: don't use `table` as a dependency of `useEffect`/`useMemo`/`useCallback` (it now changes every render); depend on the specific state values from `table.getState()` instead. See the new React Compiler guide.

## 10.0.1

### Patch Changes

- 98975c6: First publish
- 98975c6: Second try to publish something.
- e501cb1: Only use dependency versions that are at least 7 days old (pnpm `minimumReleaseAge: 10080`): `@tanstack/react-table` 9.3.1 -> 9.2.8, `@tanstack/react-virtual` 3.14.21 -> 3.14.15.

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
