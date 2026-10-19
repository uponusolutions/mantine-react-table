# Example: React Compiler

A table whose component is compiled with the React Compiler (`babel-plugin-react-compiler` through
`@vitejs/plugin-react`'s `reactCompilerPreset`). Sorting, filtering, pagination, selection, expansion,
grouping, pinning, resizing, density and full screen all keep working because `useMantineReactTable`
returns a new `table` object on every render.

To run this example:

- `npm install` or `yarn`
- `npm run start` or `yarn start`
