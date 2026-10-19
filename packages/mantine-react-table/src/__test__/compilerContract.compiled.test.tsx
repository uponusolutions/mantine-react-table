import { type FC } from 'react';

import { MantineReactTable } from '../components/MantineReactTable';
import { useMantineReactTable } from '../hooks/useMantineReactTable';
import { type MRT_TableOptions } from '../types';
import {
  getColumnTexts,
  makeColumns,
  makeData,
  type Person,
  renderWithMantine,
} from './utils';

import { screen, waitFor, within } from '@testing-library/react';
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

const UncompiledTable = ({ options }: { options?: Options }) => {
  'use no memo';
  const table = useMantineReactTable({ columns, data, ...options });
  return <MantineReactTable table={table} />;
};

it('compiles the consumer fixture with the React Compiler', () => {
  expect(CompiledTable.toString()).toMatch(/\$\[0\]/);
  expect(UncompiledTable.toString()).not.toMatch(/\$\[0\]/);
});

const openColumnActions = async (header: string) => {
  const th = screen
    .getAllByRole('columnheader')
    .find((cell) => cell.textContent?.includes(header))!;
  await userEvent.click(within(th).getByLabelText('Column Actions'));
};

describe.each<[string, FC<{ options?: Options }>]>([
  ['compiled consumer', CompiledTable],
  ['"use no memo" consumer', UncompiledTable],
])('%s', (_, Table) => {
  it('sorts when a column header sort button is clicked', async () => {
    const { container } = renderWithMantine(<Table />);
    expect(getColumnTexts(container, 'Last Name')[0]).toBe('Last25');
    await userEvent.click(screen.getByLabelText('Sort by Last Name ascending'));
    await waitFor(() =>
      expect(getColumnTexts(container, 'Last Name')[0]).toBe('Last01'),
    );
  });

  it('changes page', async () => {
    const { container } = renderWithMantine(<Table />);
    expect(getColumnTexts(container, 'First Name')[0]).toBe('Ava0');
    await userEvent.click(screen.getByLabelText('Go to next page'));
    await waitFor(() =>
      expect(getColumnTexts(container, 'First Name')[0]).toBe('Cleo10'),
    );
  });

  it('toggles density', async () => {
    const { container } = renderWithMantine(<Table />);
    const tableEl = container.querySelector('table')!;
    const before = tableEl.getAttribute('style');
    await userEvent.click(screen.getByLabelText('Toggle density'));
    await waitFor(() => expect(tableEl.getAttribute('style')).not.toBe(before));
  });

  it('toggles column filters', async () => {
    renderWithMantine(<Table />);
    const filterInput = () =>
      screen.getByPlaceholderText('Filter by First Name');
    expect(filterInput()).not.toBeVisible();
    await userEvent.click(screen.getByLabelText('Show/Hide filters'));
    await waitFor(() => expect(filterInput()).toBeVisible());
  });

  it('selects a row', async () => {
    renderWithMantine(<Table options={{ enableRowSelection: true }} />);
    const [checkbox] = screen.getAllByLabelText('Toggle select row');
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    await waitFor(() =>
      expect(screen.getAllByLabelText('Toggle select row')[0]).toBeChecked(),
    );
  });

  it('expands a row detail panel', async () => {
    renderWithMantine(
      <Table
        options={{
          renderDetailPanel: ({ row }) => (
            <div>Detail of {row.original.firstName}</div>
          ),
        }}
      />,
    );
    expect(screen.queryByText('Detail of Ava0')).toBeNull();
    await userEvent.click(screen.getAllByLabelText('Expand')[0]);
    await waitFor(() =>
      expect(screen.getByText('Detail of Ava0')).toBeInTheDocument(),
    );
  });

  it('groups by a column', async () => {
    const { container } = renderWithMantine(
      <Table options={{ enableGrouping: true }} />,
    );
    expect(container.querySelectorAll('tbody tr')).toHaveLength(10);
    await openColumnActions('State');
    await userEvent.click(await screen.findByText('Group by State'));
    await waitFor(() =>
      expect(container.querySelectorAll('tbody tr')).toHaveLength(3),
    );
  });

  it('pins a column', async () => {
    renderWithMantine(<Table options={{ enableColumnPinning: true }} />);
    const isPinned = () =>
      screen
        .getAllByRole('columnheader')
        .find((cell) => cell.textContent?.includes('State'))!
        .hasAttribute('data-column-pinned');
    expect(isPinned()).toBe(false);
    await openColumnActions('State');
    await userEvent.click(await screen.findByText('Pin to left'));
    await waitFor(() => expect(isPinned()).toBe(true));
  });
});
