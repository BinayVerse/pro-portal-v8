export interface ArtefactGoogleDriveFile {
  id: string
  name: string
  mimeType: string
  size: string
  type: string
  webViewLink?: string
  thumbnailLink?: string
  modifiedTime?: string
  googleAccessToken?: string
}

export interface GoogleDriveResponse {
  statusCode: number
  status: string
  data: ArtefactGoogleDriveFile[]
  message: string
  otherFiles: number
}

export interface GoogleDriveFetchResult {
  success: boolean
  files: ArtefactGoogleDriveFile[]
  message: string
}
