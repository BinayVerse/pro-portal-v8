import { defineStore } from 'pinia'
import type { ArtefactGoogleDriveFile } from './types'

export const useArtefactsStore = defineStore('artefacts', {
  state: () => ({
    googleDriveFiles: [] as ArtefactGoogleDriveFile[],
    isLoadingGoogleDrive: false,
    isUploadingGoogleDrive: false,
    otherFilesCount: 0,
  }),

  actions: {
    async fetchGoogleDriveFiles(folderUrl: string) {
      this.isLoadingGoogleDrive = true
      this.otherFilesCount = 0

      try {
        const data = await $fetch<{
          data: ArtefactGoogleDriveFile[]
          otherFiles: number
          message: string
        }>('/api/artefacts/google-drive-fetch', {
          method: 'POST',
          body: { folderUrl },
        })

        this.googleDriveFiles = data.data || []
        this.otherFilesCount = data.otherFiles || 0

        return {
          success: true,
          files: this.googleDriveFiles,
          message: data.message || 'Files fetched successfully'
        }
      } catch (error: any) {
        console.error('Google Drive fetch error:', error)
        this.googleDriveFiles = []
        return {
          success: false,
          files: [],
          message: this.handleError(error, 'Failed to fetch Google Drive files')
        }
      } finally {
        this.isLoadingGoogleDrive = false
      }
    },

    async uploadGoogleDriveFiles(selectedFiles: ArtefactGoogleDriveFile[], category: string) {
      this.isUploadingGoogleDrive = true

      try {
        const token = localStorage.getItem('authToken')

        const data = await $fetch('/api/artefacts/google-drive', {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: {
            selectedFileDetails: selectedFiles,
            category,
          },
        })

        return {
          success: true,
          files: data.files || [],
          message: data.message || 'Files uploaded successfully'
        }
      } catch (error: any) {
        console.error('Google Drive upload error:', error)

        // Handle authentication errors
        if (error.statusCode === 401) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
          await navigateTo('/login')
          throw new Error('Session expired. Please sign in again.')
        }

        return {
          success: false,
          files: [],
          message: this.handleError(error, 'Failed to upload Google Drive files')
        }
      } finally {
        this.isUploadingGoogleDrive = false
      }
    },

    clearGoogleDriveFiles() {
      this.googleDriveFiles = []
      this.otherFilesCount = 0
    },

    handleError(error: any, fallbackMessage: string): string {
      console.error('Artefacts store error:', error)
      
      if (error?.data?.message) {
        return error.data.message
      }
      
      if (error?.message) {
        return error.message
      }
      
      return fallbackMessage
    },
  },
})
