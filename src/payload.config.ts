import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import pino from 'pino'
import pretty from 'pino-pretty'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import initializeCrons from './crons'
import { Post } from './collections/Posts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const logger = pino(
  pretty({
    singleLine: true,
    colorize: true,
    ignore: 'level,pid,hostname',
    hideObject: true,
    sync: true,
    messageFormat: (log, messageKey): string => {
      if (typeof log[messageKey] === undefined) return ''
      return `${new Date().toISOString()} - ${String(log[messageKey])}\n`
    },
  }),
)

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception')
})
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection')
})

export default buildConfig({
  telemetry: false,
  logger,
  admin: {
    dateFormat: 'dd MMMM yyyy - HH:mm',
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Post],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  hooks: {
    afterError: [
      async (error) => {
        const refData = error.req.data?.id ? { id: error.req.data.id } : error.req.data
        logger.error(JSON.stringify({ error: error?.result?.errors[0], refData: refData }))
        return {
          response: {
            errors: error?.result?.errors,
            refData: JSON.stringify(refData),
          },
        }
      },
    ],
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
    connectOptions: {
      maxPoolSize: 50,
      minPoolSize: 5,
      maxIdleTimeMS: 300000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  }),
  sharp,
  plugins: [],
  onInit: async () => {
    initializeCrons()
  },
})
