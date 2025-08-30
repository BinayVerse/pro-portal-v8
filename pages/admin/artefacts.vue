<template>
  <div class="space-y-6">
    <!-- Header -->
    <ArtefactsHeader @upload="showUploadModal = true" />

    <!-- Stats Cards -->
    <ArtefactsStats 
      :total-artefacts="totalArtefacts"
      :processed-artefacts="processedArtefacts"
      :total-categories="totalCategories"
      :total-size="totalSize"
    />

    <!-- Search and Filters -->
    <ArtefactsFilters
      v-model:search-query="searchQuery"
      v-model:selected-category="selectedCategory"
      v-model:selected-type="selectedType"
      v-model:selected-status="selectedStatus"
      :available-categories="availableCategories"
      :categories-loading="categoriesLoading"
    />

    <!-- Artefacts Table -->
    <ArtefactsTable
      :artefacts="filteredArtefacts"
      @view-artefact="viewArtefact"
      @download-artefact="downloadArtefact"
      @delete-artefact="deleteArtefact"
      @view-summary="viewSummary"
    />

    <!-- Upload Modal -->
    <ArtefactUploadModal
      v-model:is-open="showUploadModal"
      :available-categories="availableCategories"
      :categories-loading="categoriesLoading"
      @close="showUploadModal = false"
      @file-uploaded="handleFileUploaded"
      @google-drive-uploaded="handleGoogleDriveUploaded"
      @category-added="addCategory"
      @category-deleted="deleteCategory"
    />

    <!-- Summary Modal -->
    <ArtefactSummaryModal
      v-model:is-open="showSummaryModal"
      :artefact="selectedArtefact"
      @close="showSummaryModal = false"
      @download="downloadArtefact"
    />

    <!-- Confirm Delete Category Popup -->
    <ConfirmPopup
      v-model:is-open="showConfirmPopup"
      title="Delete Category"
      :message="`Are you sure you want to delete the category '${categoryToDelete}'?`"
      details="This action cannot be undone. All artefacts in this category will be moved to 'Uncategorized'."
      confirm-text="Delete Category"
      cancel-text="Cancel"
      type="danger"
      :loading="isDeletingCategory"
      @confirm="confirmDeleteCategory"
      @cancel="cancelDeleteCategory"
    />
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '~/utils'
import { onMounted, watch, nextTick } from 'vue'
import { useNotification } from '~/composables/useNotification'

// Using admin layout
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

// Import components
import ArtefactsHeader from '~/components/admin/artefacts/ArtefactsHeader.vue'
import ArtefactsStats from '~/components/admin/artefacts/ArtefactsStats.vue'
import ArtefactsFilters from '~/components/admin/artefacts/ArtefactsFilters.vue'
import ArtefactsTable from '~/components/admin/artefacts/ArtefactsTable.vue'
import ArtefactUploadModal from '~/components/admin/artefacts/ArtefactUploadModal.vue'
import ArtefactSummaryModal from '~/components/admin/artefacts/ArtefactSummaryModal.vue'
import ConfirmPopup from '~/components/ui/ConfirmPopup.vue'

// Import stores
import { useAuthStore } from '~/stores/auth'
import { useArtefactsStore } from '~/stores/artefacts'

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const showUploadModal = ref(false)
const showSummaryModal = ref(false)
const selectedArtefact = ref(null)

// Confirm popup state
const showConfirmPopup = ref(false)
const categoryToDelete = ref('')
const isDeletingCategory = ref(false)

// Initialize stores
const authStore = useAuthStore()
const artefactsStore = useArtefactsStore()

// Get orgId from auth user
const currentUser = computed(() => authStore.user)
const orgId = computed(() => currentUser.value?.org_id)

// Fallback categories if API is not available
const fallbackCategories = [
  'HR Policy',
  'Financial',
  'Technical',
  'Analytics',
  'Legal & Compliance',
  'Policies & Procedures',
  'Product / Service Information',
  'Technical / Operational Documentation',
  'Training & Onboarding'
]

// Categories management - now from store with fallback
const availableCategories = computed(() => {
  const storeCategories = artefactsStore.getCategoryNames
  const categories = storeCategories.length > 0 ? storeCategories : fallbackCategories
  console.log('Available categories computed:', categories.length, 'from store:', storeCategories.length)
  return categories
})
const categoriesLoading = computed(() => {
  const loading = artefactsStore.isCategoryLoadingState
  console.log('Categories loading state:', loading)
  return loading
})
const categoriesError = computed(() => artefactsStore.getCategoryError)

// Sample artefacts data
const artefacts = ref([
  {
    id: 1,
    name: 'Employee Handbook 2024.pdf',
    description: 'Comprehensive guide to company policies',
    category: 'HR Policy',
    type: 'PDF',
    size: '2.3 MB',
    status: 'processed',
    uploadedBy: 'Sarah Johnson',
    lastUpdated: formatDateTime(new Date('2024-01-15T14:30:00')),
    artefact: 'Employee Handbook 2024.pdf',
  },
  {
    id: 2,
    name: 'Q4 Financial Report.docx',
    description: 'Quarterly financial reports including revenue, expenses',
    category: 'Financial',
    type: 'Word',
    size: '1.6 MB',
    status: 'processing',
    uploadedBy: 'Mike Chen',
    lastUpdated: formatDateTime(new Date('2024-01-10T09:15:00')),
    artefact: 'Q4 Financial Report.docx',
  },
  {
    id: 3,
    name: 'Product Specifications.md',
    description: 'Detailed technical specifications for the new product',
    category: 'Technical',
    type: 'Markdown',
    size: '512.0 kB',
    status: 'processed',
    uploadedBy: 'Emily Davis',
    lastUpdated: formatDateTime(new Date('2024-01-08T16:45:00')),
    artefact: 'Product Specifications.md',
  },
  {
    id: 4,
    name: 'Customer Data.csv',
    description: 'Customer demographics and behavior analysis data',
    category: 'Analytics',
    type: 'CSV',
    size: '3.1 MB',
    status: 'processed',
    uploadedBy: 'Alex Rodriguez',
    lastUpdated: formatDateTime(new Date('2024-01-20T11:20:00')),
    artefact: 'Customer Data.csv',
  },
])

// Computed properties
const totalArtefacts = computed(() => artefacts.value.length)
const processedArtefacts = computed(
  () => artefacts.value.filter((doc) => doc.status === 'processed').length,
)
const totalCategories = computed(() => {
  const categories = new Set(artefacts.value.map((doc) => doc.category))
  return categories.size
})
const totalSize = computed(() => '7.8 MB') // This would be calculated from actual file sizes

const filteredArtefacts = computed(() => {
  return artefacts.value.filter((artefact) => {
    const matchesSearch =
      !searchQuery.value ||
      artefact.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      artefact.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCategory = !selectedCategory.value || artefact.category === selectedCategory.value
    const matchesType = !selectedType.value || artefact.type === selectedType.value
    const matchesStatus = !selectedStatus.value || artefact.status === selectedStatus.value

    return matchesSearch && matchesCategory && matchesType && matchesStatus
  })
})

// Methods
const viewArtefact = (artefact: any) => {
  console.log('View artefact:', artefact)
}

const downloadArtefact = (artefact: any) => {
  console.log('Download artefact:', artefact)
}

const deleteArtefact = (artefact: any) => {
  if (confirm(`Are you sure you want to delete ${artefact.name}?`)) {
    const index = artefacts.value.findIndex((d) => d.id === artefact.id)
    if (index > -1) {
      artefacts.value.splice(index, 1)
    }
  }
}

const viewSummary = (artefact: any) => {
  selectedArtefact.value = artefact
  showSummaryModal.value = true
}

// Upload handlers
const handleFileUploaded = (artefact: any) => {
  artefacts.value.unshift(artefact)
  
  // After 2 seconds, mark as processed
  setTimeout(() => {
    const uploadedArtefact = artefacts.value.find(a => a.id === artefact.id)
    if (uploadedArtefact) {
      uploadedArtefact.status = 'processed'
    }
  }, 2000)
}

const handleGoogleDriveUploaded = (newArtefacts: any[]) => {
  newArtefacts.forEach(artefact => {
    artefacts.value.unshift(artefact)
    
    // After 2 seconds, mark as processed
    setTimeout(() => {
      const uploadedArtefact = artefacts.value.find(a => a.id === artefact.id)
      if (uploadedArtefact) {
        uploadedArtefact.status = 'processed'
      }
    }, 2000)
  })
}

// Category management methods
const addCategory = async (category: string) => {
  const trimmedCategory = category.trim()
  if (!trimmedCategory) return

  if (orgId.value) {
    // Use API if orgId is available
    try {
      await artefactsStore.createCategory(trimmedCategory, orgId.value)
    } catch (error) {
      console.error('Failed to add category:', error)
      // Show error message to user
      const { showError } = useNotification()
      showError('Failed to add category. Please try again.')
    }
  } else {
    // Fallback to local management if no orgId
    console.warn('No organization ID available, category changes will not be persisted')
    const { showWarning } = useNotification()
    showWarning('Category added locally only. Changes will not be saved.')
  }
}

const deleteCategory = (category: string) => {
  categoryToDelete.value = category
  showConfirmPopup.value = true
}

const confirmDeleteCategory = async () => {
  const category = categoryToDelete.value
  if (!category) return

  isDeletingCategory.value = true

  try {
    if (orgId.value) {
      // Use API if orgId is available
      // Find the category ID from the store
      const categoryData = artefactsStore.categories.find(cat => cat.name === category)
      if (categoryData) {
        await artefactsStore.deleteCategory(categoryData.id, orgId.value)

        // Update any existing artefacts that use this category
        artefacts.value.forEach(artefact => {
          if (artefact.category === category) {
            artefact.category = 'Uncategorized'
          }
        })

        const { showSuccess } = useNotification()
        showSuccess(`Category "${category}" deleted successfully`)
      }
    } else {
      // Fallback to local management if no orgId
      console.warn('No organization ID available, category changes will not be persisted')
      const { showWarning } = useNotification()
      showWarning('Category deleted locally only. Changes will not be saved.')

      // Update any existing artefacts that use this category (local only)
      artefacts.value.forEach(artefact => {
        if (artefact.category === category) {
          artefact.category = 'Uncategorized'
        }
      })
    }
  } catch (error) {
    console.error('Failed to delete category:', error)
    const { showError } = useNotification()
    showError('Failed to delete category. Please try again.')
  } finally {
    isDeletingCategory.value = false
    showConfirmPopup.value = false
    categoryToDelete.value = ''
  }
}

const cancelDeleteCategory = (event?: Event) => {
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  showConfirmPopup.value = false
  categoryToDelete.value = ''
  isDeletingCategory.value = false
}

// Initialize categories when orgId is available
const initializeCategories = async () => {
  if (!orgId.value) {
    console.warn('No orgId available for category fetch')
    return
  }

  const token = process.client ? localStorage.getItem('authToken') : null
  if (!token) {
    console.warn('No auth token available for category fetch')
    return
  }

  try {
    console.log('Fetching categories for org:', orgId.value, 'with token:', token ? 'present' : 'missing')
    await artefactsStore.fetchCategories(orgId.value)
    console.log('Categories fetched successfully:', artefactsStore.categories.length)
  } catch (error: any) {
    console.error('Failed to fetch document categories:', error)

    // Handle specific error types
    if (error?.statusCode === 401 || error?.response?.status === 401) {
      console.error('Authentication error - token may be invalid or expired')
      const { showError } = useNotification()
      showError('Session expired. Please log in again.')

      // Clear invalid auth and redirect
      if (process.client) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      }
      await navigateTo('/login')
    } else {
      const { showError } = useNotification()
      showError('Failed to load categories. Please refresh the page.')
    }
  }
}

// Initialize page data
const initializePage = async () => {
  try {
    // Ensure auth is initialized first
    await authStore.initializeStore()

    // Wait a bit for auth to settle
    await nextTick()

    // Check if user is authenticated and has orgId
    if (authStore.isLoggedIn && orgId.value) {
      console.log('User authenticated with orgId:', orgId.value)
      // Ensure token is available before fetching categories
      const token = process.client ? localStorage.getItem('authToken') : null
      if (token) {
        await initializeCategories()
      } else {
        console.warn('No auth token available')
      }
    } else {
      console.warn('User not authenticated or no orgId available')
    }
  } catch (error) {
    console.error('Failed to initialize page:', error)
  }
}

// Watch for orgId changes and fetch categories
watch(orgId, (newOrgId) => {
  if (newOrgId && authStore.isLoggedIn) {
    console.log('OrgId changed, fetching categories:', newOrgId)
    const token = process.client ? localStorage.getItem('authToken') : null
    if (token) {
      initializeCategories()
    }
  }
}, { immediate: false })

// Watch for authentication changes
watch(() => authStore.isLoggedIn, (isAuth) => {
  if (isAuth && orgId.value) {
    console.log('Authentication status changed, fetching categories')
    const token = process.client ? localStorage.getItem('authToken') : null
    if (token) {
      initializeCategories()
    }
  }
})

// Initialize everything on mount
onMounted(async () => {
  await initializePage()
})

useHead({
  title: 'Artefact Management - Admin Dashboard',
})
</script>
