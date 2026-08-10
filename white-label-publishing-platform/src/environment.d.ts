declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      ENTRA_TENANT_ID: string
      ENTRA_CLIENT_ID: string
      ENTRA_CLIENT_SECRET: string
      ENTRA_REDIRECT_URI: string
      ENTRA_ALLOWED_EMAILS: string
      ENTRA_VALIDATE_MFA_CLAIM: string
      PAYLOAD_PASSWORD_LOGIN_ALLOWED_EMAILS: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
