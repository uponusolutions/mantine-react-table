import { type ReactNode } from 'react';

import { MantineProvider } from '@mantine/core';

import { type MRT_ColumnDef } from '../types';

import { render, type RenderResult } from '@testing-library/react';

export interface Person {
  age: number;
  firstName: string;
  id: string;
  lastName: string;
  state: string;
}

const firstNames = ['Ava', 'Ben', 'Cleo', 'Dan', 'Eli', 'Fay', 'Gus', 'Hana'];
const states = ['Ohio', 'Utah', 'Iowa'];

export const makeData = (count = 25): Person[] =>
  Array.from({ length: count }, (_, i) => ({
    age: 20 + ((i * 7) % 50),
    firstName: `${firstNames[i % firstNames.length]}${i}`,
    id: `${i}`,
    lastName: `Last${String(count - i).padStart(2, '0')}`,
    state: states[i % states.length],
  }));

export const makeColumns = (): MRT_ColumnDef<Person>[] => [
  { accessorKey: 'firstName', header: 'First Name' },
  { accessorKey: 'lastName', header: 'Last Name' },
  { accessorKey: 'age', header: 'Age', sortFn: 'basic' },
  { accessorKey: 'state', header: 'State' },
];

export const renderWithMantine = (ui: ReactNode): RenderResult =>
  render(ui, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">{children}</MantineProvider>
    ),
  });

/** text content of the column with the given header for every rendered body row */
export const getColumnTexts = (container: HTMLElement, header: string) => {
  const headerCells = Array.from(
    container.querySelectorAll('thead tr:last-child th'),
  );
  const index = headerCells.findIndex((th) => th.textContent?.includes(header));
  if (index === -1) return [];
  return Array.from(container.querySelectorAll('tbody tr'))
    .map((tr) => tr.querySelectorAll('td')[index]?.textContent ?? '')
    .filter(Boolean);
};

export const deepFreeze = <T,>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
};
