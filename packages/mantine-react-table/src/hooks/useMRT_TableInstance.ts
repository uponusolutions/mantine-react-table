import { useMemo, useRef, useState } from 'react';

import { type TableOptions, useTable } from '@tanstack/react-table';

import {
  type MRT_Cell,
  type MRT_Column,
  type MRT_ColumnDef,
  type MRT_ColumnFilterFnsState,
  type MRT_ColumnOrderState,
  type MRT_ColumnResizingState,
  type MRT_DefinedTableOptions,
  type MRT_DensityState,
  type MRT_FilterOption,
  type MRT_GroupingState,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_RowData,
  type MRT_StatefulTableOptions,
  type MRT_TableFeatures,
  type MRT_TableInstance,
  type MRT_TableState,
  type MRT_Updater,
} from '../types';
import {
  getAllLeafColumnDefs,
  getColumnId,
  getDefaultColumnFilterFn,
  prepareColumns,
} from '../utils/column.utils';
import {
  getDefaultColumnOrderIds,
  showRowActionsColumn,
  showRowDragColumn,
  showRowExpandColumn,
  showRowNumbersColumn,
  showRowPinningColumn,
  showRowSelectionColumn,
  showRowSpacerColumn,
} from '../utils/displayColumn.utils';
import { createMRT_TableFeatures, createRow } from '../utils/tanstack.helpers';
import { getMRT_RowActionsColumnDef } from './display-columns/getMRT_RowActionsColumnDef';
import { getMRT_RowDragColumnDef } from './display-columns/getMRT_RowDragColumnDef';
import { getMRT_RowExpandColumnDef } from './display-columns/getMRT_RowExpandColumnDef';
import { getMRT_RowNumbersColumnDef } from './display-columns/getMRT_RowNumbersColumnDef';
import { getMRT_RowPinningColumnDef } from './display-columns/getMRT_RowPinningColumnDef';
import { getMRT_RowSelectColumnDef } from './display-columns/getMRT_RowSelectColumnDef';
import { getMRT_RowSpacerColumnDef } from './display-columns/getMRT_RowSpacerColumnDef';
import { useMRT_Effects } from './useMRT_Effects';

/**
 * The MRT hook that wraps the TanStack useTable hook and adds additional functionality
 * @param definedTableOptions - table options with proper defaults set
 * @returns the MRT table instance
 */
export const useMRT_TableInstance = <TData extends MRT_RowData>(
  definedTableOptions: MRT_DefinedTableOptions<TData>,
): MRT_TableInstance<TData> => {
  'use no memo';
  const lastSelectedRowId = useRef<null | string>(null);
  const bottomToolbarRef = useRef<HTMLDivElement | null>(null);
  const editInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const filterInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const tableHeadCellRefs = useRef<Record<string, HTMLTableCellElement>>({});
  const tablePaperRef = useRef<HTMLDivElement | null>(null);
  const topToolbarRef = useRef<HTMLDivElement | null>(null);
  const tableHeadRef = useRef<HTMLTableSectionElement | null>(null);
  const tableFooterRef = useRef<HTMLTableSectionElement | null>(null);

  //the TanStack features (incl. row models and fn registries) cannot change after mount
  const [features] = useState(() =>
    createMRT_TableFeatures({
      aggregationFns: definedTableOptions.aggregationFns,
      coreRowModel: definedTableOptions.coreRowModel,
      expandedRowModel: definedTableOptions.expandedRowModel,
      facetedMinMaxValues: definedTableOptions.facetedMinMaxValues,
      facetedRowModel: definedTableOptions.facetedRowModel,
      facetedUniqueValues: definedTableOptions.facetedUniqueValues,
      filteredRowModel: definedTableOptions.filteredRowModel,
      filterFns: definedTableOptions.filterFns,
      groupedRowModel: definedTableOptions.groupedRowModel,
      paginatedRowModel: definedTableOptions.paginatedRowModel,
      sortedRowModel: definedTableOptions.sortedRowModel,
      sortFns: definedTableOptions.sortFns,
    }),
  );

  //transform initial state with proper column order
  const initialState: Partial<MRT_TableState<TData>> = useMemo(() => {
    const initState = definedTableOptions.initialState ?? {};
    initState.columnOrder =
      initState.columnOrder ??
      getDefaultColumnOrderIds({
        ...definedTableOptions,
        state: {
          ...definedTableOptions.initialState,
          ...definedTableOptions.state,
        },
      } as MRT_StatefulTableOptions<TData>);
    initState.globalFilterFn = definedTableOptions.globalFilterFn ?? 'fuzzy';
    return initState;
  }, []);

  definedTableOptions.initialState = initialState;

  const [creatingRow, _setCreatingRow] = useState<MRT_Row<TData> | null>(
    initialState.creatingRow ?? null,
  );
  const [columnFilterFns, setColumnFilterFns] =
    useState<MRT_ColumnFilterFnsState>(() =>
      Object.assign(
        {},
        ...getAllLeafColumnDefs(
          definedTableOptions.columns as MRT_ColumnDef<TData>[],
        ).map((col) => ({
          [getColumnId(col)]:
            col.filterFn instanceof Function
              ? (col.filterFn.name ?? 'custom')
              : (col.filterFn ??
                initialState?.columnFilterFns?.[getColumnId(col)] ??
                getDefaultColumnFilterFn(col)),
        })),
      ),
    );
  const [columnOrder, onColumnOrderChange] = useState<MRT_ColumnOrderState>(
    initialState.columnOrder ?? [],
  );
  const [columnResizing, onColumnResizingChange] =
    useState<MRT_ColumnResizingState>(
      initialState.columnResizing ?? {
        columnSizingStart: [],
        deltaOffset: null,
        deltaPercentage: null,
        isResizingColumn: false,
        startOffset: null,
        startSize: null,
      },
    );
  const [density, setDensity] = useState<MRT_DensityState>(
    initialState?.density ?? 'md',
  );
  const [draggingColumn, setDraggingColumn] =
    useState<MRT_Column<TData> | null>(initialState.draggingColumn ?? null);
  const [draggingRow, setDraggingRow] = useState<MRT_Row<TData> | null>(
    initialState.draggingRow ?? null,
  );
  const [editingCell, setEditingCell] = useState<MRT_Cell<TData> | null>(
    initialState.editingCell ?? null,
  );
  const [editingRow, setEditingRow] = useState<MRT_Row<TData> | null>(
    initialState.editingRow ?? null,
  );
  const [globalFilterFn, setGlobalFilterFn] = useState<MRT_FilterOption>(
    initialState.globalFilterFn ?? 'fuzzy',
  );
  const [grouping, onGroupingChange] = useState<MRT_GroupingState>(
    initialState.grouping ?? [],
  );
  const [hoveredColumn, setHoveredColumn] = useState<null | Partial<
    MRT_Column<TData>
  >>(initialState.hoveredColumn ?? null);
  const [hoveredRow, setHoveredRow] = useState<null | Partial<MRT_Row<TData>>>(
    initialState.hoveredRow ?? null,
  );
  const [isFullScreen, setIsFullScreen] = useState<boolean>(
    initialState?.isFullScreen ?? false,
  );
  const [pagination, onPaginationChange] = useState<MRT_PaginationState>(
    initialState?.pagination ?? { pageIndex: 0, pageSize: 10 },
  );
  const [showAlertBanner, setShowAlertBanner] = useState<boolean>(
    initialState?.showAlertBanner ?? false,
  );
  const [showColumnFilters, setShowColumnFilters] = useState<boolean>(
    initialState?.showColumnFilters ?? false,
  );
  const [showGlobalFilter, setShowGlobalFilter] = useState<boolean>(
    initialState?.showGlobalFilter ?? false,
  );
  const [showToolbarDropZone, setShowToolbarDropZone] = useState<boolean>(
    initialState?.showToolbarDropZone ?? false,
  );

  definedTableOptions.state = {
    columnFilterFns,
    columnOrder,
    columnResizing,
    creatingRow,
    density,
    draggingColumn,
    draggingRow,
    editingCell,
    editingRow,
    globalFilterFn,
    grouping,
    hoveredColumn,
    hoveredRow,
    isFullScreen,
    pagination,
    showAlertBanner,
    showColumnFilters,
    showGlobalFilter,
    showToolbarDropZone,
    ...definedTableOptions.state,
  };

  //The table options now include all state needed to help determine column visibility and order logic
  const statefulTableOptions =
    definedTableOptions as MRT_StatefulTableOptions<TData>;

  //don't recompute columnDefs while resizing column or dragging column/row
  const columnDefsRef = useRef<MRT_ColumnDef<TData>[]>([]);
  statefulTableOptions.columns =
    statefulTableOptions.state.columnResizing.isResizingColumn ||
    statefulTableOptions.state.draggingColumn ||
    statefulTableOptions.state.draggingRow
      ? columnDefsRef.current
      : prepareColumns({
          columnDefs: [
            ...([
              showRowPinningColumn(statefulTableOptions) &&
                getMRT_RowPinningColumnDef(statefulTableOptions),
              showRowDragColumn(statefulTableOptions) &&
                getMRT_RowDragColumnDef(statefulTableOptions),
              showRowActionsColumn(statefulTableOptions) &&
                getMRT_RowActionsColumnDef(statefulTableOptions),
              showRowExpandColumn(statefulTableOptions) &&
                getMRT_RowExpandColumnDef(statefulTableOptions),
              showRowSelectionColumn(statefulTableOptions) &&
                getMRT_RowSelectColumnDef(statefulTableOptions),
              showRowNumbersColumn(statefulTableOptions) &&
                getMRT_RowNumbersColumnDef(statefulTableOptions),
            ].filter(Boolean) as MRT_ColumnDef<TData>[]),
            ...statefulTableOptions.columns,
            ...([
              showRowSpacerColumn(statefulTableOptions) &&
                getMRT_RowSpacerColumnDef(statefulTableOptions),
            ].filter(Boolean) as MRT_ColumnDef<TData>[]),
          ],
          tableOptions: statefulTableOptions,
        });
  columnDefsRef.current = statefulTableOptions.columns;

  //if loading, generate blank rows to show skeleton loaders
  statefulTableOptions.data = useMemo(
    () =>
      (statefulTableOptions.state.isLoading ||
        statefulTableOptions.state.showSkeletons) &&
      !statefulTableOptions.data.length
        ? [
            ...Array(
              Math.min(statefulTableOptions.state.pagination.pageSize, 20),
            ).fill(null),
          ].map(() =>
            Object.assign(
              {},
              ...getAllLeafColumnDefs(statefulTableOptions.columns).map(
                (col) => ({
                  [getColumnId(col)]: null,
                }),
              ),
            ),
          )
        : statefulTableOptions.data,
    [
      statefulTableOptions.data,
      statefulTableOptions.state.isLoading,
      statefulTableOptions.state.showSkeletons,
    ],
  );

  const reactTable = useTable<MRT_TableFeatures, TData>({
    onColumnOrderChange,
    onColumnResizingChange,
    onGroupingChange,
    onPaginationChange,
    ...statefulTableOptions,
    features,
    globalFilterFn: statefulTableOptions.filterFns?.[globalFilterFn ?? 'fuzzy'],
  } as unknown as TableOptions<MRT_TableFeatures, TData>);

  //keep one stable MRT table instance across renders (like TanStack v8 did)
  const tableRef = useRef<MRT_TableInstance<TData> | null>(null);
  if (!tableRef.current) tableRef.current = {} as MRT_TableInstance<TData>;
  const table = Object.assign(
    tableRef.current,
    reactTable,
  ) as unknown as MRT_TableInstance<TData>;

  //TanStack v9 removed `table.getState()`; MRT provides a snapshot of the last render
  const tableState = {
    ...statefulTableOptions.state,
    ...reactTable.state,
  } as MRT_TableState<TData>;
  table.getState = () => tableState;

  table.refs = {
    bottomToolbarRef,
    editInputRefs,
    filterInputRefs,
    lastSelectedRowId,
    searchInputRef,
    tableContainerRef,
    tableFooterRef,
    tableHeadCellRefs,
    tableHeadRef,
    tablePaperRef,
    topToolbarRef,
  };

  table.setCreatingRow = (row: MRT_Updater<MRT_Row<TData> | null | true>) => {
    let _row = row;
    if (row === true) {
      _row = createRow(table);
    }
    if (statefulTableOptions?.onCreatingRowChange) {
      statefulTableOptions.onCreatingRowChange(_row as MRT_Row<TData> | null);
    } else {
      _setCreatingRow(_row as MRT_Row<TData> | null);
    }
  };
  table.setColumnFilterFns =
    statefulTableOptions.onColumnFilterFnsChange ?? setColumnFilterFns;
  table.setDensity = statefulTableOptions.onDensityChange ?? setDensity;
  table.setDraggingColumn =
    statefulTableOptions.onDraggingColumnChange ?? setDraggingColumn;
  table.setDraggingRow =
    statefulTableOptions.onDraggingRowChange ?? setDraggingRow;
  table.setEditingCell =
    statefulTableOptions.onEditingCellChange ?? setEditingCell;
  table.setEditingRow =
    statefulTableOptions.onEditingRowChange ?? setEditingRow;
  table.setGlobalFilterFn =
    statefulTableOptions.onGlobalFilterFnChange ?? setGlobalFilterFn;
  table.setHoveredColumn =
    statefulTableOptions.onHoveredColumnChange ?? setHoveredColumn;
  table.setHoveredRow =
    statefulTableOptions.onHoveredRowChange ?? setHoveredRow;
  table.setIsFullScreen =
    statefulTableOptions.onIsFullScreenChange ?? setIsFullScreen;
  table.setShowAlertBanner =
    statefulTableOptions.onShowAlertBannerChange ?? setShowAlertBanner;
  table.setShowColumnFilters =
    statefulTableOptions.onShowColumnFiltersChange ?? setShowColumnFilters;
  table.setShowGlobalFilter =
    statefulTableOptions.onShowGlobalFilterChange ?? setShowGlobalFilter;
  table.setShowToolbarDropZone =
    statefulTableOptions.onShowToolbarDropZoneChange ?? setShowToolbarDropZone;

  useMRT_Effects(table);

  return table;
};
