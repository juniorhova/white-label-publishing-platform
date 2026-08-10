import type { CollectionAfterLoginHook } from 'payload'

import type { User } from '@/payload-types'

export const loginTypeFieldName = 'loginType'

export type LoginType = 'Entra ID' | 'Local'

export const markLocalLoginType: CollectionAfterLoginHook<User> = async ({ req, user }) => {
  await req.payload.db.updateOne({
    id: user.id,
    collection: 'users',
    data: {
      [loginTypeFieldName]: 'Local',
    },
    req,
    returning: false,
  })

  return {
    ...user,
    [loginTypeFieldName]: 'Local',
  }
}

export const markUserLoginType = async ({
  loginType,
  req,
  user,
}: {
  loginType: LoginType
  req: Parameters<typeof markLocalLoginType>[0]['req']
  user: User
}): Promise<User> => {
  await req.payload.db.updateOne({
    id: user.id,
    collection: 'users',
    data: {
      [loginTypeFieldName]: loginType,
    },
    req,
    returning: false,
  })

  return {
    ...user,
    [loginTypeFieldName]: loginType,
  }
}
