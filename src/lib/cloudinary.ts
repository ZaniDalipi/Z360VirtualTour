import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  public_id: string
  secure_url: string
  url: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
}

export interface CloudinaryUploadOptions {
  folder?: string
  transformation?: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
  }
  resource_type?: 'image' | 'video' | 'raw' | 'auto'
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  file: Buffer | string,
  options: CloudinaryUploadOptions = {}
): Promise<UploadResult> {
  const { folder = 'z360-tours', transformation, resource_type = 'image' } = options

  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type,
    }

    if (transformation) {
      uploadOptions.transformation = transformation
    }

    // If file is a Buffer, convert to base64
    const fileData = Buffer.isBuffer(file)
      ? `data:image/jpeg;base64,${file.toString('base64')}`
      : file

    cloudinary.uploader.upload(fileData, uploadOptions, (error, result) => {
      if (error) {
        reject(error)
      } else if (result) {
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          created_at: result.created_at,
        })
      } else {
        reject(new Error('Upload failed: No result returned'))
      }
    })
  })
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result?.result === 'ok')
      }
    })
  })
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  } = {}
): string {
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options

  const transformations: string[] = []

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  transformations.push(`c_${crop}`)
  transformations.push(`q_${quality}`)
  transformations.push(`f_${format}`)

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(',')}/${publicId}`
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: (Buffer | string)[],
  options: CloudinaryUploadOptions = {}
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map((file) => uploadImage(file, options))
  )
  return results
}

export default cloudinary
