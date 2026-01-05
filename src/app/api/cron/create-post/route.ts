import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação do cron
    const authHeader = req.headers.get('authorization')

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    const { totalDocs } = await payload.count({
      collection: 'posts',
    })

    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${totalDocs + 1}`)
    const data = await response.json()

    const newPost = await payload.create({
      collection: 'posts',
      data: {
        title: data.title,
        body: data.body,
      },
    })

    return NextResponse.json({
      success: true,
      post: newPost.id,
      totalPosts: totalDocs + 1
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
