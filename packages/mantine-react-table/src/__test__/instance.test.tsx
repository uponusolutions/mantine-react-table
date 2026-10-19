import { useMantineReactTable } from '../hooks/useMantineReactTable';
import { type MRT_TableOptions } from '../types';
import { makeColumns, makeData, type Person } from './utils';

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const columns = makeColumns();
const data = makeData();

const renderTable = (options: Partial<MRT_TableOptions<Person>> = {}) =>
  renderHook(
    (props: Partial<MRT_TableOptions<Person>>) =>
      useMantineReactTable({ columns, data, ...props }),
    { initialProps: options },
  );

describe('useMantineReactTable instance contract', () => {
  it('returns a new table object on every render', () => {
    const { rerender, result } = renderTable();
    const first = result.current;
    rerender({});
    expect(result.current).not.toBe(first);
  });

  it('keeps table.refs and the ref objects stable', () => {
    const { rerender, result } = renderTable();
    const first = result.current;
    rerender({});
    expect(result.current.refs).toBe(first.refs);
    expect(result.current.refs.tableContainerRef).toBe(
      first.refs.tableContainerRef,
    );
    expect(result.current.refs.editInputRefs).toBe(first.refs.editInputRefs);
  });

  it('keeps plain useState setters stable', () => {
    const { rerender, result } = renderTable();
    const first = result.current;
    rerender({});
    expect(result.current.setDensity).toBe(first.setDensity);
    expect(result.current.setIsFullScreen).toBe(first.setIsFullScreen);
    expect(result.current.setShowColumnFilters).toBe(
      first.setShowColumnFilters,
    );
  });

  it('getState() reflects state after each setter, older tables keep their snapshot', () => {
    const { result } = renderTable();
    const initial = result.current;

    act(() => result.current.setDensity('xs'));
    expect(result.current.getState().density).toBe('xs');

    act(() => result.current.setSorting([{ desc: true, id: 'age' }]));
    expect(result.current.getState().sorting).toEqual([
      { desc: true, id: 'age' },
    ]);

    act(() => result.current.setPageIndex(2));
    expect(result.current.getState().pagination.pageIndex).toBe(2);

    act(() => result.current.setShowColumnFilters(true));
    expect(result.current.getState().showColumnFilters).toBe(true);

    act(() => result.current.setIsFullScreen(true));
    expect(result.current.getState().isFullScreen).toBe(true);

    act(() => result.current.setColumnFilterFns({ age: 'between' }));
    expect(result.current.getState().columnFilterFns).toEqual({
      age: 'between',
    });

    //snapshot semantics: the first render's table still describes the first render
    expect(initial.getState().density).toBe('md');
    expect(initial.getState().sorting).toEqual([]);
    expect(initial.getState().isFullScreen).toBe(false);
  });

  it('lets controlled state and onXChange props win', () => {
    const onDensityChange = vi.fn();
    const onSortingChange = vi.fn();
    const { result } = renderTable({
      onDensityChange,
      onSortingChange,
      state: { density: 'xl', sorting: [{ desc: false, id: 'firstName' }] },
    });

    act(() => result.current.setDensity('xs'));
    act(() => result.current.setSorting([{ desc: true, id: 'age' }]));

    expect(onDensityChange).toHaveBeenCalledWith('xs');
    expect(onSortingChange).toHaveBeenCalled();
    expect(result.current.getState().density).toBe('xl');
    expect(result.current.getState().sorting).toEqual([
      { desc: false, id: 'firstName' },
    ]);
  });

  it('exposes the options of the current render on table.options', () => {
    const { rerender, result } = renderTable({ enableSorting: true });
    expect(result.current.options.enableSorting).toBe(true);
    rerender({ enableSorting: false });
    expect(result.current.options.enableSorting).toBe(false);
  });

  it('creates rows through setCreatingRow(true) on the current table', () => {
    const { result } = renderTable({ enableEditing: true });
    act(() => result.current.setCreatingRow(true));
    expect(result.current.getState().creatingRow).toBeTruthy();
    act(() => result.current.setCreatingRow(null));
    expect(result.current.getState().creatingRow).toBeNull();
  });
});
