import { MantineReactTable } from '../components/MantineReactTable';
import { useMantineReactTable } from '../hooks/useMantineReactTable';
import {
  type MRT_ColumnDef,
  type MRT_TableOptions,
  type MRT_TableState,
} from '../types';
import { getMRT_Rows } from '../utils/row.utils';
import {
  deepFreeze,
  makeColumns,
  makeData,
  type Person,
  renderWithMantine,
} from './utils';

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const FrozenTable = (props: MRT_TableOptions<Person>) => {
  const table = useMantineReactTable(props);
  return <MantineReactTable table={table} />;
};

describe('caller-owned objects are never mutated', () => {
  it('renders with deeply frozen columns, data and initialState', () => {
    const columns = deepFreeze<MRT_ColumnDef<Person>[]>([
      {
        columns: [
          { accessorKey: 'firstName', header: 'First Name' },
          { accessorKey: 'lastName', header: 'Last Name' },
        ],
        header: 'Name',
      },
      {
        accessorKey: 'age',
        aggregationFn: ['min', 'max'],
        header: 'Age',
        sortFn: 'basic',
      },
      { accessorKey: 'state', filterFn: 'equals', header: 'State' },
    ]);
    const data = deepFreeze(makeData());
    const initialState = deepFreeze<Partial<MRT_TableState<Person>>>({
      density: 'xs',
      grouping: ['state'],
      showColumnFilters: true,
    });
    const snapshot = JSON.stringify({ columns, data, initialState });

    expect(() =>
      renderWithMantine(
        <FrozenTable
          columns={columns}
          data={data}
          enableGrouping
          enableRowActions
          enableRowSelection
          initialState={initialState}
          renderRowActions={() => null}
        />,
      ),
    ).not.toThrow();
    expect(JSON.stringify({ columns, data, initialState })).toBe(snapshot);
  });

  it('keeps two tables sharing an initialState and columns constant independent', () => {
    const INITIAL_STATE: Partial<MRT_TableState<Person>> = { density: 'xs' };
    const COLUMNS = makeColumns();
    const data = makeData();
    const useTwoTables = () => ({
      a: useMantineReactTable({
        columns: COLUMNS,
        data,
        enableRowSelection: true,
        initialState: INITIAL_STATE,
      }),
      b: useMantineReactTable({
        columns: COLUMNS,
        data,
        initialState: INITIAL_STATE,
      }),
    });
    const { result } = renderHook(useTwoTables);

    //table a has a selection display column, table b does not
    expect(result.current.a.getState().columnOrder).toContain('mrt-row-select');
    expect(result.current.b.getState().columnOrder).not.toContain(
      'mrt-row-select',
    );

    act(() =>
      result.current.a.setColumnOrder([
        'mrt-row-select',
        'state',
        'age',
        'lastName',
        'firstName',
      ]),
    );
    expect(result.current.b.getState().columnOrder).toEqual([
      'firstName',
      'lastName',
      'age',
      'state',
    ]);

    expect(INITIAL_STATE).toEqual({ density: 'xs' });
    expect(COLUMNS).toEqual(makeColumns());
  });

  it('does not sort the row model in place when ranking global filter results', () => {
    const data: Person[] = [
      { age: 30, firstName: 'Xbob', id: 'a', lastName: 'A', state: 'Ohio' },
      { age: 40, firstName: 'bob', id: 'b', lastName: 'B', state: 'Utah' },
    ];
    const { result } = renderHook(() =>
      useMantineReactTable({
        columns: makeColumns(),
        data,
        initialState: { globalFilter: 'bob' },
      }),
    );
    const table = result.current;
    const rowModelIds = () =>
      table.getPrePaginatedRowModel().rows.map((row) => row.id);
    const before = rowModelIds();

    const ranked = getMRT_Rows(table).map((row) => row.id);

    expect(ranked).toEqual(['1', '0']);
    expect(rowModelIds()).toEqual(before);
  });
});
