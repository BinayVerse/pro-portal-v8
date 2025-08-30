import { defineStore } from 'pinia'

export interface DocumentCategory {
  id: string
  name: string
  org_id: string
  created_at?: string
  updated_at?: string
}

export interface OrganizationState {
  // Document Categories
  docCats: DocumentCategory[]
  newDocCat: DocumentCategory | null
  docCatLoading: boolean
  docCatError: string | null
}

export const useOrganizationStore = defineStore('organizationStore', {
  state: (): OrganizationState => ({
    // Document Categories
    docCats: [],
    newDocCat: null,
    docCatLoading: false,
    docCatError: null,
  }),

  getters: {
    // Document Categories getters
    getDocumentCategories: (state): DocumentCategory[] => state.docCats,
    getDocumentCategoryNames: (state): string[] => state.docCats.map(cat => cat.name),
    isDocCatLoading: (state): boolean => state.docCatLoading,
    getDocCatError: (state): string | null => state.docCatError,
  },

  actions: {
    // Helper methods
    handleError(error: any, defaultMessage: string, silent: boolean = false): string {
      const { showError } = useNotification()
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?._data?.message ||
        error?.data?.message ||
        error?.message ||
        defaultMessage
      
      console.error('Organization store error:', error)
      
      if (!silent) {
        showError(errorMessage)
      }
      return errorMessage
    },

    handleSuccess(message: string): void {
      const { showSuccess } = useNotification()
      this.docCatError = null
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

    // Document Category Actions
    async fetchDocumentCategories(id: string) {
      try {
        this.docCatLoading = true
        this.docCatError = null

        const { data } = await $fetch<{ data: DocumentCategory[] }>(
          `/api/organization/documents/category/${id}`,
          {
            headers: this.getAuthHeaders(),
          }
        )

        this.docCats = data || []
        this.newDocCat = null
      } catch (error: any) {
        console.error('Fetch document categories error:', error)
        
        if (!await this.handleAuthError(error)) {
          this.docCatError = this.handleError(error, 'Failed to fetch document categories')
        }
      } finally {
        this.docCatLoading = false
      }
    },

    async createDocumentCategory(category: string, id: string) {
      try {
        this.docCatLoading = true
        this.docCatError = null

        const { data, message } = await $fetch<{ data: DocumentCategory; message: string }>(
          '/api/organization/documents/category/add',
          {
            method: 'POST',
            body: { name: category, org_id: id },
            headers: this.getAuthHeaders(),
          }
        )

        this.newDocCat = data || null
        this.handleSuccess(message || 'Category added successfully!')
        
        // Refresh the categories list
        await this.fetchDocumentCategories(id)
      } catch (error: any) {
        console.error('Create document category error:', error)
        
        if (!await this.handleAuthError(error)) {
          this.docCatError = this.handleError(error, 'Error creating category')
        }
      } finally {
        this.docCatLoading = false
      }
    },

    async deleteDocumentCategory(categoryId: string, orgId: string) {
      try {
        this.docCatLoading = true
        this.docCatError = null

        await $fetch(`/api/organization/documents/category/${categoryId}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        })

        this.handleSuccess('Category deleted successfully!')
        
        // Refresh the categories list
        await this.fetchDocumentCategories(orgId)
      } catch (error: any) {
        console.error('Delete document category error:', error)
        
        if (!await this.handleAuthError(error)) {
          this.docCatError = this.handleError(error, 'Error deleting category')
        }
      } finally {
        this.docCatLoading = false
      }
    },

    // Clear methods
    clearDocumentCategories() {
      this.docCats = []
      this.newDocCat = null
      this.docCatError = null
    },

    clearDocCatError() {
      this.docCatError = null
    },
  },
})
