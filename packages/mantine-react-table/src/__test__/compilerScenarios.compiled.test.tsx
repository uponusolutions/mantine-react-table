import { StrictMode, useState } from 'react';

import { MantineReactTable } from '../components/MantineReactTable';
import { useMantineReactTable } from '../hooks/useMantineReactTable';
import {
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_SortingState,
  type MRT_TableOptions,
} from '../types';
import {
  getColumnTexts,
  makeColumns,
  makeData,
  type Person,
  renderWithMantine,
} from './utils';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

//this file is compiled by babel-plugin-react-compiler (see vitest.config.mts)

const columns = makeColumns();
const data = makeData();

type Options = Partial<MRT_TableOptions<Person>>;

const CompiledTable = ({ options }: { options?: Options }) => {
  const table = useMantineReactTable({ columns, data, ...options });
  return <MantineReactTable table={table} />;
};

const sortByLastName = () =>
  userEvent.click(screen.getByLabelText('Sort by Last Name ascending'));

describe('compiled consumer scenarios', () => {
  it('re-renders render props that read table.getState()', async () => {
    renderWithMantine(
      <CompiledTable
        options={{
          renderTopToolbarCustomActions: ({ table }) => (
            <span>density: {table.getState().density}</span>
          ),
        }}
      />,
    );
    expect(screen.getByText('density: md')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Toggle density'));
    await waitFor(() =>
      expect(screen.getByText('density: xs')).toBeInTheDocument(),
    );
  });

  it('re-renders row actions that read table.getState()', async () => {
    renderWithMantine(
      <CompiledTable
        options={{
          enableRowActions: true,
          renderRowActions: ({ table }) => (
            <span>page {table.getState().pagination.pageIndex}</span>
          ),
        }}
      />,
    );
    expect(screen.getAllByText('page 0')).toHaveLength(10);
    await userEvent.click(screen.getByLabelText('Go to next page'));
    await waitFor(() => expect(screen.getAllByText('page 1')).toHaveLength(10));
  });

  it('supports state controlled by the consumer', async () => {
    const ControlledSorting = () => {
      const [sorting, setSorting] = useState<MRT_SortingState>([]);
      const table = useMantineReactTable({
        columns,
        data,
        onSortingChange: setSorting,
        state: { sorting },
      });
      return (
        <>
          <output>sorted: {sorting[0]?.id ?? 'none'}</output>
          <MantineReactTable table={table} />
        </>
      );
    };
    const { container } = renderWithMantine(<ControlledSorting />);
    await sortByLastName();
    await waitFor(() =>
      expect(screen.getByText('sorted: lastName')).toBeInTheDocument(),
    );
    expect(getColumnTexts(container, 'Last Name')[0]).toBe('Last01');
  });

  it('supports server-side pagination', async () => {
    const ServerTable = () => {
      const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: 5,
      });
      const start = pagination.pageIndex * pagination.pageSize;
      const table = useMantineReactTable({
        columns,
        data: data.slice(start, start + pagination.pageSize),
        manualPagination: true,
        onPaginationChange: setPagination,
        rowCount: data.length,
        state: { pagination },
      });
      return <MantineReactTable table={table} />;
    };
    const { container } = renderWithMantine(<ServerTable />);
    expect(getColumnTexts(container, 'First Name')).toHaveLength(5);
    await userEvent.click(screen.getByLabelText('Go to next page'));
    await waitFor(() =>
      expect(getColumnTexts(container, 'First Name')[0]).toBe('Fay5'),
    );
  });

  it('supports row virtualization', async () => {
    const { container } = renderWithMantine(
      <CompiledTable
        options={{
          enablePagination: false,
          enableRowVirtualization: true,
          //happy-dom has no layout, give the virtualizer a viewport to fill
          rowVirtualizerOptions: {
            initialRect: { height: 600, width: 800 },
            observeElementRect: (_, callback) => {
              callback({ height: 600, width: 800 });
            },
          },
        }}
      />,
    );
    await waitFor(() =>
      expect(getColumnTexts(container, 'Last Name')[0]).toBe('Last25'),
    );
    await sortByLastName();
    await waitFor(() =>
      expect(getColumnTexts(container, 'Last Name')[0]).toBe('Last01'),
    );
  });

  it('freezes the body while resizing a column and updates it afterwards', async () => {
    const ResizableTable = () => {
      const table = useMantineReactTable({
        columns,
        data,
        enableColumnResizing: true,
      });
      return (
        <>
          <button
            onClick={() =>
              table.setColumnResizing((old) => ({
                ...old,
                isResizingColumn: 'age',
              }))
            }
          >
            start resize
          </button>
          <button
            onClick={() => table.setSorting([{ desc: false, id: 'lastName' }])}
          >
            sort
          </button>
          <button
            onClick={() =>
              table.setColumnResizing((old) => ({
                ...old,
                isResizingColumn: false,
              }))
            }
          >
            end resize
          </button>
          <MantineReactTable table={table} />
        </>
      );
    };
    const { container } = renderWithMantine(<ResizableTable />);
    await userEvent.click(screen.getByText('start resize'));
    await userEvent.click(screen.getByText('sort'));
    //Memo_MRT_TableBody keeps the body as it was while a column is resized
    expect(getColumnTexts(container, 'Last Name')[0]).toBe('Last25');
    await userEvent.click(screen.getByText('end resize'));
    await waitFor(() =>
      expect(getColumnTexts(container, 'Last Name')[0]).toBe('Last01'),
    );
  });

  it.each(['rows', 'cells'] as const)(
    'keeps working with memoMode "%s"',
    async (memoMode) => {
      const { container } = renderWithMantine(
        <CompiledTable options={{ memoMode }} />,
      );
      await sortByLastName();
      await waitFor(() =>
        expect(getColumnTexts(container, 'Last Name')[0]).toBe('Last01'),
      );
    },
  );

  it('re-renders a memoMode "table-body" body when the data changes', async () => {
    const DataSwap = () => {
      const [rows, setRows] = useState(data);
      const table = useMantineReactTable({
        columns,
        data: rows,
        memoMode: 'table-body',
      });
      return (
        <>
          <button onClick={() => setRows(data.slice(3))}>swap data</button>
          <MantineReactTable table={table} />
        </>
      );
    };
    const { container } = renderWithMantine(<DataSwap />);
    expect(getColumnTexts(container, 'First Name')[0]).toBe('Ava0');
    await userEvent.click(screen.getByText('swap data'));
    await waitFor(() =>
      expect(getColumnTexts(container, 'First Name')[0]).toBe('Dan3'),
    );
  });

  it('works under StrictMode double rendering', async () => {
    const { container } = renderWithMantine(
      <StrictMode>
        <CompiledTable options={{ enableRowSelection: true }} />
      </StrictMode>,
    );
    await sortByLastName();
    await waitFor(() =>
      expect(getColumnTexts(container, 'Last Name')[0]).toBe('Last01'),
    );
    await userEvent.click(screen.getAllByLabelText('Toggle select row')[0]);
    await waitFor(() =>
      expect(screen.getAllByLabelText('Toggle select row')[0]).toBeChecked(),
    );
    await userEvent.click(screen.getByLabelText('Toggle density'));
    await waitFor(() =>
      expect(screen.getAllByLabelText('Toggle select row')[0]).toBeChecked(),
    );
  });
});

//compiled child components (module level, so 'infer' mode compiles them)
const ExpandedLabel = ({
  expanded,
  source,
}: {
  expanded: boolean;
  source: string;
}) => (
  <span>
    {source}: {expanded ? 'open' : 'closed'}
  </span>
);
//a render helper returning JSX closes over `row`; the compiler caches the helper, and the JSX around its
//result, on `row`, which never changes identity
const ExpandedFromRow = ({ row }: { row: MRT_Row<Person> }) => {
  const renderLabel = () => <b>{row.getIsExpanded() ? 'open' : 'closed'}</b>;
  return <span>row: {renderLabel()}</span>;
};

it('compiles the child components', () => {
  expect(ExpandedFromRow.toString()).toMatch(/\$\[0\]/);
});

describe('compiled child components in cells (documented pitfall)', () => {
  const pitfallColumns: MRT_ColumnDef<Person>[] = [
    ...columns,
    {
      Cell: ({ row, table }) =>
        row.index === 0 ? (
          <>
            <ExpandedLabel
              expanded={
                (table.getState().expanded as Record<string, boolean>)[
                  row.id
                ] === true
              }
              source="state"
            />
            <ExpandedLabel expanded={row.getIsExpanded()} source="prop" />
            <ExpandedFromRow row={row} />
          </>
        ) : null,
      header: 'Expanded',
      id: 'expandedState',
    },
  ];

  it('updates values passed as props, while row.getIsX() cached on the stable row goes stale', async () => {
    const PitfallTable = () => {
      const table = useMantineReactTable({
        columns: pitfallColumns,
        data,
        renderDetailPanel: () => <div>detail</div>,
      });
      return <MantineReactTable table={table} />;
    };
    renderWithMantine(<PitfallTable />);
    expect(document.body.textContent).toContain('state: closed');
    expect(document.body.textContent).toContain('prop: closed');
    expect(document.body.textContent).toContain('row: closed');

    await userEvent.click(screen.getAllByLabelText('Expand')[0]);

    await waitFor(() =>
      expect(document.body.textContent).toContain('state: open'),
    );
    expect(document.body.textContent).toContain('prop: open');
    //the compiled child caches the helper's output on the (stable) TanStack row object, so the method result
    //is stale; this is the hazard the React Compiler guide documents, not something MRT can fix
    expect(document.body.textContent).toContain('row: closed');
  });
});
