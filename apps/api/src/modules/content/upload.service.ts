// upload.service.ts — MinIO file upload via @aws-sdk/client-s3
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import path from 'path'

export interface MultipartFile {
  filename: string
  mimetype: string
  file: import('stream').Readable
}

const MAX_VIDEO_BYTES = 500 * 1024 * 1024 // 500 MB
const MAX_IMAGE_BYTES = 10 * 1024 * 1024  // 10 MB

const BUCKET = process.env.MINIO_BUCKET ?? 'focusquest'
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9000'

function createS3Client(): S3Client {
  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    },
    forcePathStyle: true,
  })
}

async function streamToBuffer(stream: import('stream').Readable, maxBytes: number): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    let totalBytes = 0

    stream.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length
      if (totalBytes > maxBytes) {
        stream.destroy(new Error(`File exceeds maximum size of ${maxBytes} bytes`))
        return
      }
      chunks.push(chunk)
    })
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

export class UploadService {
  private s3: S3Client

  constructor() {
    this.s3 = createS3Client()
  }

  async uploadVideo(file: MultipartFile): Promise<string> {
    if (!file.mimetype.startsWith('video/')) {
      throw Object.assign(new Error('Invalid file type. Expected video/*'), { statusCode: 400 })
    }

    const buffer = await streamToBuffer(file.file, MAX_VIDEO_BYTES)
    const ext = path.extname(file.filename) || '.mp4'
    const key = `videos/${randomUUID()}${ext}`

    await this.s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
        ContentLength: buffer.length,
      }),
    )

    return `${PUBLIC_URL}/${BUCKET}/${key}`
  }

  async uploadImage(file: MultipartFile): Promise<string> {
    if (!file.mimetype.startsWith('image/')) {
      throw Object.assign(new Error('Invalid file type. Expected image/*'), { statusCode: 400 })
    }

    const buffer = await streamToBuffer(file.file, MAX_IMAGE_BYTES)
    const ext = path.extname(file.filename) || '.jpg'
    const key = `images/${randomUUID()}${ext}`

    await this.s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
        ContentLength: buffer.length,
      }),
    )

    return `${PUBLIC_URL}/${BUCKET}/${key}`
  }
}
