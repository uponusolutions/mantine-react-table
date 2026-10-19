import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; //if using mantine date picker features
import '@uponu-solutions/mantine-react-table/styles.css'; //make sure MRT styles were imported in your app root (once)
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
} from '@uponu-solutions/mantine-react-table';

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  state: string;
};

const data: Person[] = [
  { firstName: 'Zachary', lastName: 'Davis', age: 33, state: 'Ohio' },
  { firstName: 'Robert', lastName: 'Smith', age: 45, state: 'Utah' },
  { firstName: 'Kevin', lastName: 'Yan', age: 27, state: 'Ohio' },
  { firstName: 'John', lastName: 'Upton', age: 52, state: 'Iowa' },
  { firstName: 'Nathan', lastName: 'Harris', age: 39, state: 'Utah' },
];

//no useMemo needed: the compiler memoizes, and module-level values are stable anyway
const columns: MRT_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First Name' },
  { accessorKey: 'lastName', header: 'Last Name' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'state', header: 'State' },
];

//a compiled child component: pass row state as a prop instead of calling row.getIsX() inside cached JSX
const DetailPanel = ({ row, expanded }: { row: MRT_Row<Person>; expanded: boolean }) => (
  <div>
    {row.original.firstName} is {expanded ? 'expanded' : 'collapsed'}
  </div>
);

const Example = () => {
  const table = useMantineReactTable({
    columns,
    data,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableGrouping: true,
    enableRowSelection: true,
    renderDetailPanel: ({ row }) => (
      <DetailPanel row={row} expanded={row.getIsExpanded()} />
    ),
    //reads the snapshot of the current render
    renderTopToolbarCustomActions: ({ table }) => (
      <span>Density: {table.getState().density}</span>
    ),
  });

  return <MantineReactTable table={table} />;
};

export default Example;
