import * as migration_20260607_021003_initial from './20260607_021003_initial';
import * as migration_20260607_061955 from './20260607_061955';

export const migrations = [
  {
    up: migration_20260607_021003_initial.up,
    down: migration_20260607_021003_initial.down,
    name: '20260607_021003_initial',
  },
  {
    up: migration_20260607_061955.up,
    down: migration_20260607_061955.down,
    name: '20260607_061955'
  },
];
