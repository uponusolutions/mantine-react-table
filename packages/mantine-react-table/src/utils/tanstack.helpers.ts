import { type JSX, type ReactNode } from 'react';

import {
  flexRender as _flexRender,
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  constructRow,
  createExpandedRowModel,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  type Renderable,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  type StockFeatures,
  tableFeatures,
} from '@tanstack/react-table';

import { MRT_AggregationFns } from '../fns/aggregationFns';
import { MRT_FilterFns } from '../fns/filterFns';
import { MRT_SortFns } from '../fns/sortFns';
import {
  type MRT_ColumnHelper,
  type MRT_DisplayColumnDef,
  type MRT_GroupColumnDef,
  type MRT_Row,
  type MRT_RowData,
  type MRT_RowModelOverrides,
  type MRT_TableFeatures,
  type MRT_TableInstance,
} from '../types';
import { getAllLeafColumnDefs, getColumnId } from './column.utils';

export const flexRender = _flexRender as (
  Comp: Renderable<any>,
  props: any,
) => JSX.Element | ReactNode;

export function createMRTColumnHelper<
  TData extends MRT_RowData,
>(): MRT_ColumnHelper<TData> {
  return {
    accessor: (accessor, column) => {
      return typeof accessor === 'function'
        ? ({
            ...column,
            accessorFn: accessor,
          } as any)
        : {
            ...column,
            accessorKey: accessor,
          };
    },
    display: (column) => column as MRT_DisplayColumnDef<TData>,
    group: (column) => column as MRT_GroupColumnDef<TData>,
  };
}

const MRT_FeatureModules = {
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
} satisfies Omit<StockFeatures, 'cellSelectionFeature' | 'cellSpanningFeature'>;

/**
 * Builds the fixed TanStack feature set MRT registers: all stock features (except cell selection and cell spanning),
 * all row models, and the aggregation, filter and sort function registries.
 */
export const createMRT_TableFeatures = ({
  aggregationFns = MRT_AggregationFns as MRT_TableFeatures['aggregationFns'],
  filterFns = MRT_FilterFns as MRT_TableFeatures['filterFns'],
  sortFns = MRT_SortFns as MRT_TableFeatures['sortFns'],
  ...overrides
}: MRT_RowModelOverrides &
  Partial<
    Pick<MRT_TableFeatures, 'aggregationFns' | 'filterFns' | 'sortFns'>
  > = {}): MRT_TableFeatures =>
  tableFeatures<MRT_TableFeatures>({
    ...MRT_FeatureModules,
    expandedRowModel: createExpandedRowModel(),
    facetedMinMaxValues: createFacetedMinMaxValues(),
    facetedRowModel: createFacetedRowModel(),
    facetedUniqueValues: createFacetedUniqueValues(),
    filteredRowModel: createFilteredRowModel(),
    groupedRowModel: createGroupedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
    //undefined overrides must not clobber the defaults
    ...Object.fromEntries(Object.entries(overrides).filter(([, v]) => !!v)),
    aggregationFns,
    filterFns,
    sortFns,
  } as MRT_TableFeatures);

export const createRow = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  originalRow?: TData,
  rowIndex = -1,
  depth = 0,
  subRows?: MRT_Row<TData>[],
  parentId?: string,
): MRT_Row<TData> =>
  constructRow(
    //leaf columns hold the core TanStack table, which provides the row prototype and options
    (table.getAllLeafColumns()[0]?.table ?? table) as any,
    'mrt-row-create',
    originalRow ??
      Object.assign(
        {},
        ...getAllLeafColumnDefs(table.options.columns).map((col) => ({
          [getColumnId(col)]: '',
        })),
      ),
    rowIndex,
    depth,
    subRows as any,
    parentId,
  ) as MRT_Row<TData>;
