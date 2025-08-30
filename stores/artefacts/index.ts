import { defineStore } from 'pinia'
import type { ArtefactGoogleDriveFile, DocumentCategory } from './types'

export const useArtefactsStore = defineStore('artefacts', {
  state: () => ({
    googleDriveFiles: [] as ArtefactGoogleDriveFile[],
    isLoadingGoogleDrive: false,
    isUploadingGoogleDrive: false,
    otherFilesCount: 0,
    // Document Categories
    categories: [] as DocumentCategory[],
    newCategory: null as DocumentCategory | null,
    isCategoryLoading: false,
    categoryError: null as string | null,
  }),

  getters: {
    // Category getters
    getCategories: (state): DocumentCategory[] => state.categories,
    getCategoryNames: (state): string[] => state.categories.map(cat => cat.name),
    isCategoryLoadingState: (state): boolean => state.isCategoryLoading,
    getCategoryError: (state): string | null => state.categoryError,
  },

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

    // Helper methods for categories
    handleCategoryError(error: any, defaultMessage: string, silent: boolean = false): string {
      const { showError } = useNotification()
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?._data?.message ||
        error?.data?.message ||
        error?.message ||
        defaultMessage

      console.error('Category error:', error)

      if (!silent) {
        showError(errorMessage)
      }
      return errorMessage
    },

    handleCategorySuccess(message: string): void {
      const { showSuccess } = useNotification()
      this.categoryError = null
      showSuccess(message)
    },

    getAuthHeaders(extra: Record<string, string> = {}) {
      let token: string | null = null
      if (process.client) {
        token = localStorage.getItem('authToken')
      }
      if (!token) {
        const authCookie = useCookie('authToken')
        token = authCookie.value || null
      }

      return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
      }
    },

    async handleAuthError(err: any): Promise<boolean> {
      if (err?.statusCode === 401 || err?.response?.status === 401) {
        if (process.client) {
          localStorage.removeItem('authUser')
          localStorage.removeItem('authToken')
          setTimeout(() => {
            navigateTo('/login')
          }, 500)
        }
        const authCookie = useCookie('authToken')
        authCookie.value = null
        return true
      }
      return false
    },

    // Category Actions
    async fetchCategories(orgId: string) {
      try {
        this.isCategoryLoading = true
        this.categoryError = null

        const { data } = await $fetch<{ data: DocumentCategory[] }>(
          `/api/artefacts/category/${orgId}`,
          {
            headers: this.getAuthHeaders(),
          }
        )

        this.categories = data || []
        this.newCategory = null
      } catch (error: any) {
        console.error('Fetch categories error:', error)

        if (!await this.handleAuthError(error)) {
          this.categoryError = this.handleCategoryError(error, 'Failed to fetch categories')
        }
      } finally {
        this.isCategoryLoading = false
      }
    },

    async createCategory(categoryName: string, orgId: string) {
      try {
        this.isCategoryLoading = true
        this.categoryError = null

        const { data, message } = await $fetch<{ data: DocumentCategory; message: string }>(
          '/api/artefacts/category/add',
          {
            method: 'POST',
            body: { name: categoryName, org_id: orgId },
            headers: this.getAuthHeaders(),
          }
        )

        this.newCategory = data || null
        this.handleCategorySuccess(message || 'Category added successfully!')

        // Refresh the categories list
        await this.fetchCategories(orgId)
      } catch (error: any) {
        console.error('Create category error:', error)

        if (!await this.handleAuthError(error)) {
          this.categoryError = this.handleCategoryError(error, 'Error creating category')
        }
      } finally {
        this.isCategoryLoading = false
      }
    },

    async deleteCategory(categoryId: string, orgId: string) {
      try {
        this.isCategoryLoading = true
        this.categoryError = null

        await $fetch(`/api/artefacts/category/${categoryId}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        })

        this.handleCategorySuccess('Category deleted successfully!')

        // Refresh the categories list
        await this.fetchCategories(orgId)
      } catch (error: any) {
        console.error('Delete category error:', error)

        if (!await this.handleAuthError(error)) {
          this.categoryError = this.handleCategoryError(error, 'Error deleting category')
        }
      } finally {
        this.isCategoryLoading = false
      }
    },

    async getAllCategories() {
      try {
        this.isCategoryLoading = true
        this.categoryError = null

        const { data } = await $fetch<{ data: DocumentCategory[] }>(
          '/api/artefacts/category/all',
          {
            headers: this.getAuthHeaders(),
          }
        )

        this.categories = data || []
        return data || []
      } catch (error: any) {
        console.error('Get all categories error:', error)

        if (!await this.handleAuthError(error)) {
          this.categoryError = this.handleCategoryError(error, 'Failed to fetch categories')
        }
        return []
      } finally {
        this.isCategoryLoading = false
      }
    },

    // Clear methods
    clearCategories() {
      this.categories = []
      this.newCategory = null
      this.categoryError = null
    },

    clearCategoryError() {
      this.categoryError = null
    },
  },
})
