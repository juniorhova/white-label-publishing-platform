import { Forbidden, type CollectionBeforeLoginHook } from 'payload'

import { getEntraAuthConfig, getPasswordLoginAllowedEmails } from '@/auth/entra/config'
import type { User } from '@/payload-types'

export const restrictPasswordLoginToAllowedEmails: CollectionBeforeLoginHook<User> = ({
  req,
  user,
}) => {
  const entraConfig = getEntraAuthConfig()
  const allowedEmails = getPasswordLoginAllowedEmails()

  if (!entraConfig.enabled || allowedEmails.length === 0) {
    return user
  }

  const email = user.email?.toLowerCase()
  if (email && allowedEmails.includes(email)) {
    return user
  }

  throw new Forbidden(req.t)
}
