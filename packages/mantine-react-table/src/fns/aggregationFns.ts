import { aggregationFns } from '@tanstack/react-table';

// Note: since TanStack Table v9 these are `AggregationFnDef` objects (`{ aggregate, merge? }`), not callable functions.
export const MRT_AggregationFns: typeof aggregationFns = { ...aggregationFns };
