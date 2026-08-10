import * as migration_20260809_143404_initial_schema from './20260809_143404_initial_schema'
import * as migration_20260809_224547_add_user_login_type from './20260809_224547_add_user_login_type'

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
]
