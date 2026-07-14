import 'server-only'
import { put } from '@vercel/blob'
import crypto from 'crypto'

export async function uploadImage(buffer: Buffer, contentType: string, folder = 'avatars') {
  const ext = contentType.split('/')[1] ?? 'jpg'
  const key = `${folder}/${crypto.randomUUID()}.${ext}`

  const blob = await put(key, buffer, {
    access:      'public',
    contentType,
  })

  return blob.url
}
