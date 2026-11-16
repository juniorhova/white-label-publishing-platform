import * as migration_20260809_143404_initial_schema from './20260809_143404_initial_schema'
import * as migration_20260809_224547_add_user_login_type from './20260809_224547_add_user_login_type'
import * as migration_20261115_172043_home_portfolio_hero from './20261115_172043_home_portfolio_hero'
import * as migration_20261115_230307_personal_home_youtube from './20261115_230307_personal_home_youtube'
import * as migration_20261115_231802_align_home_approved_layout from './20261115_231802_align_home_approved_layout'
import * as migration_20261115_235414_home_interactive_sections from './20261115_235414_home_interactive_sections'
import * as migration_20261116_001516_roadmap_weekly_materials from './20261116_001516_roadmap_weekly_materials'

export const migrations = [
  {
    up: migration_20260809_143404_initial_schema.up,
    down: migration_20260809_143404_initial_schema.down,
    name: '20260809_143404_initial_schema',
  },
  {
    up: migration_20260809_224547_add_user_login_type.up,
    down: migration_20260809_224547_add_user_login_type.down,
    name: '20260809_224547_add_user_login_type',
  },
  {
    up: migration_20261115_172043_home_portfolio_hero.up,
    down: migration_20261115_172043_home_portfolio_hero.down,
    name: '20261115_172043_home_portfolio_hero',
  },
  {
    up: migration_20261115_230307_personal_home_youtube.up,
    down: migration_20261115_230307_personal_home_youtube.down,
    name: '20261115_230307_personal_home_youtube',
  },
  {
    up: migration_20261115_231802_align_home_approved_layout.up,
    down: migration_20261115_231802_align_home_approved_layout.down,
    name: '20261115_231802_align_home_approved_layout',
  },
  {
    up: migration_20261115_235414_home_interactive_sections.up,
    down: migration_20261115_235414_home_interactive_sections.down,
    name: '20261115_235414_home_interactive_sections',
  },
  {
    up: migration_20261116_001516_roadmap_weekly_materials.up,
    down: migration_20261116_001516_roadmap_weekly_materials.down,
    name: '20261116_001516_roadmap_weekly_materials',
  },
]
