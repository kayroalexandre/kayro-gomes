import * as migration_20260607_021003_initial from './20260607_021003_initial';
import * as migration_20260607_061955 from './20260607_061955';
import * as migration_20260607_204115 from './20260607_204115';
import * as migration_20260612_172100_fix_empty_lexical_state from './20260612_172100_fix_empty_lexical_state';
import * as migration_20260612_183426_add_hero_overlay_fields from './20260612_183426_add_hero_overlay_fields';
import * as migration_20260612_195126_add_hero_image_fit_and_search_enabled from './20260612_195126_add_hero_image_fit_and_search_enabled';
import * as migration_20260621_143929_add_hero_scroll_indicator_fields from './20260621_143929_add_hero_scroll_indicator_fields';

export const migrations = [
  {
    up: migration_20260607_021003_initial.up,
    down: migration_20260607_021003_initial.down,
    name: '20260607_021003_initial',
  },
  {
    up: migration_20260607_061955.up,
    down: migration_20260607_061955.down,
    name: '20260607_061955',
  },
  {
    up: migration_20260607_204115.up,
    down: migration_20260607_204115.down,
    name: '20260607_204115',
  },
  {
    up: migration_20260612_172100_fix_empty_lexical_state.up,
    down: migration_20260612_172100_fix_empty_lexical_state.down,
    name: '20260612_172100_fix_empty_lexical_state',
  },
  {
    up: migration_20260612_183426_add_hero_overlay_fields.up,
    down: migration_20260612_183426_add_hero_overlay_fields.down,
    name: '20260612_183426_add_hero_overlay_fields',
  },
  {
    up: migration_20260612_195126_add_hero_image_fit_and_search_enabled.up,
    down: migration_20260612_195126_add_hero_image_fit_and_search_enabled.down,
    name: '20260612_195126_add_hero_image_fit_and_search_enabled',
  },
  {
    up: migration_20260621_143929_add_hero_scroll_indicator_fields.up,
    down: migration_20260621_143929_add_hero_scroll_indicator_fields.down,
    name: '20260621_143929_add_hero_scroll_indicator_fields'
  },
];
