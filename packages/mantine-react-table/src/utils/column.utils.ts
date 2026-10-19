import {
  type MRT_AggregationFnDef,
  type MRT_Column,
  type MRT_ColumnDef,
  type MRT_ColumnOrderState,
  type MRT_DefinedColumnDef,
  type MRT_DefinedTableOptions,
  type MRT_FilterOption,
  type MRT_LegacyAggregationFn,
  type MRT_Row,
  type MRT_RowData,
} from '../types';

export const getColumnId = <TData extends MRT_RowData>(
  columnDef: MRT_ColumnDef<TData>,
): string =>
  columnDef.id ?? columnDef.accessorKey?.toString?.() ?? columnDef.header;

export const getAllLeafColumnDefs = <TData extends MRT_RowData>(
  columns: MRT_ColumnDef<TData>[],
): MRT_ColumnDef<TData>[] => {
  const allLeafColumnDefs: MRT_ColumnDef<TData>[] = [];
  const getLeafColumns = (cols: MRT_ColumnDef<TData>[]) => {
    cols.forEach((col) => {
      if (col.columns) {
        getLeafColumns(col.columns);
      } else {
        allLeafColumnDefs.push(col);
      }
    });
  };
  getLeafColumns(columns);
  return allLeafColumnDefs;
};

export const toMRT_AggregationFnDef = <TData extends MRT_RowData>(
  fn: MRT_AggregationFnDef<TData> | MRT_LegacyAggregationFn<TData>,
): MRT_AggregationFnDef<TData> =>
  typeof fn === 'function'
    ? {
        aggregate: (ctx) =>
          fn(
            ctx.columnId,
            ctx.rows as unknown as MRT_Row<TData>[],
            (ctx.subRows ?? ctx.rows) as unknown as MRT_Row<TData>[],
          ),
      }
    : fn;

/**
 * Maps a visual side to the logical TanStack pin position, respecting text direction.
 */
export const getMRT_PinPosition = (
  side: 'left' | 'right',
  dir: 'ltr' | 'rtl' = 'ltr',
): 'end' | 'start' => ((side === 'left') !== (dir === 'rtl') ? 'start' : 'end');

export const prepareColumns = <TData extends MRT_RowData>({
  columnDefs,
  tableOptions,
}: {
  columnDefs: MRT_ColumnDef<TData>[];
  tableOptions: MRT_DefinedTableOptions<TData>;
}): MRT_DefinedColumnDef<TData>[] => {
  const {
    aggregationFns = {},
    defaultDisplayColumn,
    filterFns = {},
    sortFns = {},
    state: { columnFilterFns = {} } = {},
  } = tableOptions;
  return columnDefs.map((columnDef) => {
    //assign columnId
    if (!columnDef.id) columnDef.id = getColumnId(columnDef);
    //assign columnDefType
    if (!columnDef.columnDefType) columnDef.columnDefType = 'data';
    if (columnDef.columns?.length) {
      columnDef.columnDefType = 'group';
      //recursively prepare columns if this is a group column
      columnDef.columns = prepareColumns({
        columnDefs: columnDef.columns,
        tableOptions,
      });
    } else if (columnDef.columnDefType === 'data') {
      //assign aggregationFns if multiple aggregationFns are provided
      if (Array.isArray(columnDef.aggregationFn)) {
        const defs = (columnDef.aggregationFn as any[]).map((fn) =>
          typeof fn === 'string'
            ? aggregationFns[fn]
            : toMRT_AggregationFnDef(fn),
        );
        columnDef.aggregationFn = {
          aggregate: (ctx: any) => defs.map((def) => def?.aggregate(ctx)),
        } as MRT_AggregationFnDef<TData>;
      } else if (typeof columnDef.aggregationFn === 'function') {
        columnDef.aggregationFn = toMRT_AggregationFnDef(
          columnDef.aggregationFn,
        );
      }

      //assign filterFns
      if (Object.keys(filterFns).includes(columnFilterFns[columnDef.id])) {
        columnDef.filterFn =
          filterFns[columnFilterFns[columnDef.id]] ?? filterFns.fuzzy;
        (columnDef as MRT_DefinedColumnDef<TData>)._filterFn =
          columnFilterFns[columnDef.id];
      }

      //assign sortFns
      if (Object.keys(sortFns).includes(columnDef.sortFn as string)) {
        columnDef.sortFn = sortFns[columnDef.sortFn as string] as any;
      }
    } else if (columnDef.columnDefType === 'display') {
      columnDef = {
        ...(defaultDisplayColumn as MRT_ColumnDef<TData>),
        ...columnDef,
      };
    }
    return columnDef;
  }) as MRT_DefinedColumnDef<TData>[];
};

export const reorderColumn = <TData extends MRT_RowData>(
  draggedColumn: MRT_Column<TData>,
  targetColumn: MRT_Column<TData>,
  columnOrder: MRT_ColumnOrderState,
): MRT_ColumnOrderState => {
  if (draggedColumn.getCanPin()) {
    draggedColumn.pin(targetColumn.getIsPinned());
  }
  const newColumnOrder = [...columnOrder];
  newColumnOrder.splice(
    newColumnOrder.indexOf(targetColumn.id),
    0,
    newColumnOrder.splice(newColumnOrder.indexOf(draggedColumn.id), 1)[0],
  );
  return newColumnOrder;
};

export const getDefaultColumnFilterFn = <TData extends MRT_RowData>(
  columnDef: MRT_ColumnDef<TData>,
): MRT_FilterOption => {
  const { filterVariant } = columnDef;
  if (filterVariant === 'multi-select') return 'arrIncludesSome';
  if (filterVariant?.includes('range')) return 'betweenInclusive';
  if (['checkbox', 'date', 'select'].includes(filterVariant || ''))
    return 'equals';
  return 'fuzzy';
};
