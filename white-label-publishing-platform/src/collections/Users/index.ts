import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isSecureCookie } from '../../auth/entra/config'
import { markLocalLoginType } from '../../auth/loginType'
import { restrictPasswordLoginToAllowedEmails } from '../../auth/passwordFallback'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: {
    cookies: {
      sameSite: 'Lax',
      secure: isSecureCookie(),
    },
    lockTime: 15 * 60 * 1000,
    maxLoginAttempts: 5,
    tokenExpiration: 60 * 60 * 2,
  },
  hooks: {
    afterLogin: [markLocalLoginType],
    beforeLogin: [restrictPasswordLoginToAllowedEmails],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'loginType',
      type: 'text',
      admin: {
        description: 'Shows how the current Payload admin session was created.',
        position: 'sidebar',
        readOnly: true,
      },
      label: 'Login Type',
    },
  ],
  timestamps: true,
}
