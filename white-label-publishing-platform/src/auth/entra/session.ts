import {
  createLocalReq,
  generatePayloadCookie,
  getFieldsToSign,
  getPayload,
  jwtSign,
  type SanitizedCollectionConfig,
} from 'payload'
import { addSessionToUser } from 'payload/shared'

import config from '@payload-config'
import type { User } from '@/payload-types'
import { markUserLoginType } from '@/auth/loginType'

type PayloadSessionUser = User & {
  _strategy: 'local-jwt'
  collection: 'users'
}

export const createPayloadSessionForUser = async ({
  request,
  user,
}: {
  request: Request
  user: User
}): Promise<string> => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const usersCollection = payload.collections.users.config as SanitizedCollectionConfig
  const req = await createLocalReq({ req: { headers: request.headers } }, payload)

  const markedUser = await markUserLoginType({
    loginType: 'Entra ID',
    req,
    user,
  })

  const userForSession: PayloadSessionUser = {
    ...markedUser,
    collection: 'users',
    _strategy: 'local-jwt',
  }

  const userForJWT: PayloadSessionUser = {
    ...markedUser,
    collection: 'users',
    _strategy: 'local-jwt',
  }

  const session = await addSessionToUser({
    collectionConfig: usersCollection,
    payload,
    req,
    user: userForSession,
  })

  const fieldsToSign = getFieldsToSign({
    collectionConfig: usersCollection,
    email: user.email,
    sid: session.sid,
    user: userForJWT,
  })

  const { token } = await jwtSign({
    fieldsToSign,
    secret: payload.secret,
    tokenExpiration: usersCollection.auth.tokenExpiration,
  })

  return generatePayloadCookie({
    collectionAuthConfig: usersCollection.auth,
    cookiePrefix: payloadConfig.cookiePrefix || 'payload',
    token,
  })
}
