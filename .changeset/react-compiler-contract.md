---
'@uponu-solutions/mantine-react-table': major
---

Support consumers compiled with the React Compiler.

- `useMantineReactTable` returns a new `table` object on every render of the component that calls it (it used to return one stable, mutated object). A compiled (or `memo`ized) `<MantineReactTable table={table} />` now re-renders when table state changes. TanStack's core instance inside stays stable.
- `table.getState()` and `table.options` are snapshots of the render that produced that `table`. `table.refs` is a stable object, and its ref objects keep their identity. Plain state setters (`setDensity`, `setIsFullScreen`, ...) are stable; setters replaced by an `onXChange` option and `setCreatingRow` are not.
- `initialState`, `columns` (including group columns) and `data` are no longer mutated, so frozen objects and constants shared between tables work. `getPrePaginatedRowModel().rows` is no longer sorted in place when ranking global filter results.
- `memoMode: 'table-body'` now re-renders the body when `data` changes (the comparator used to compare the stable instance with itself).
- Detail panels open again: rows are expandable by default when `renderDetailPanel` is set (TanStack v9 refuses to expand rows that cannot expand). Pass `getRowCanExpand` to override.
- Migration: don't use `table` as a dependency of `useEffect`/`useMemo`/`useCallback` (it now changes every render); depend on the specific state values from `table.getState()` instead. See the new React Compiler guide.
