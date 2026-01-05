import payloadConfig, { logger } from '@/payload.config'
import cron from 'node-cron'
import { getPayload } from 'payload'

const initializeCrons = () => {
  const globalAny: any = global

  if (globalAny.cronsInitialized) {
    console.log('Crons already initialized, skipping...')
    return
  }

  globalAny.cronsInitialized = true

  cron.schedule('* * * * *', async () => {
    logger.info('Running cron job')

    const payload = await getPayload({ config: payloadConfig })

    const { totalDocs } = await payload.count({
      collection: 'posts',
    })

    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${totalDocs + 1}`)
    const data = await response.json()

    await payload.create({
      collection: 'posts',
      data: {
        title: data.title,
        body: data.body,
      },
    })
  })
}

export default initializeCrons
