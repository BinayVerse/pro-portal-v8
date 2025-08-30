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
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '~/utils'
import { onMounted, watch } from 'vue'
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

// Import stores
import { useAuthStore } from '~/stores/auth'
import { useOrganizationStore } from '~/stores/organization'

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const showUploadModal = ref(false)
const showSummaryModal = ref(false)
const selectedArtefact = ref(null)

// Initialize stores
const authStore = useAuthStore()
const organizationStore = useOrganizationStore()

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
  const storeCategories = organizationStore.getDocumentCategoryNames
  return storeCategories.length > 0 ? storeCategories : fallbackCategories
})
const categoriesLoading = computed(() => organizationStore.isDocCatLoading)
const categoriesError = computed(() => organizationStore.getDocCatError)

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
      await organizationStore.createDocumentCategory(trimmedCategory, orgId.value)
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

const deleteCategory = async (category: string) => {
  if (orgId.value) {
    // Use API if orgId is available
    try {
      // Find the category ID from the store
      const categoryToDelete = organizationStore.docCats.find(cat => cat.name === category)
      if (categoryToDelete) {
        await organizationStore.deleteDocumentCategory(categoryToDelete.id, orgId.value)

        // Update any existing artefacts that use this category
        artefacts.value.forEach(artefact => {
          if (artefact.category === category) {
            artefact.category = 'Uncategorized'
          }
        })
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      // Show error message to user
      const { showError } = useNotification()
      showError('Failed to delete category. Please try again.')
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
}

// Initialize categories when orgId is available
const initializeCategories = async () => {
  if (orgId.value) {
    try {
      await organizationStore.fetchDocumentCategories(orgId.value)
    } catch (error) {
      console.error('Failed to fetch document categories:', error)
    }
  }
}

// Watch for orgId changes and fetch categories
watch(orgId, (newOrgId) => {
  if (newOrgId) {
    initializeCategories()
  }
}, { immediate: true })

// Initialize auth store on mount
onMounted(() => {
  authStore.initializeStore()
  if (orgId.value) {
    initializeCategories()
  }
})

useHead({
  title: 'Artefact Management - Admin Dashboard',
})
</script>
