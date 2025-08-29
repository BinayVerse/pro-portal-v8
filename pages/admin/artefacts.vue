<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">Artefact Management</h1>
        <p class="text-gray-400">
          Upload, organize, and manage artefacts for AI processing and chat capabilities.
        </p>
      </div>
      <div>
        <button
          @click="showUploadModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <UIcon name="heroicons:cloud-arrow-up" class="w-4 h-4" />
          <span>Upload Artefact</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Documents -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Total Artefacts</p>
            <p class="text-3xl font-bold text-white mt-2">{{ totalArtefacts }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:document-text" class="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      <!-- Processed -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Processed</p>
            <p class="text-3xl font-bold text-white mt-2">{{ processedArtefacts }}</p>
          </div>
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:check-circle" class="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Categories</p>
            <p class="text-3xl font-bold text-white mt-2">{{ totalCategories }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:funnel" class="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      <!-- Total Size -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Total Size</p>
            <p class="text-3xl font-bold text-white mt-2">{{ totalSize }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:circle-stack" class="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search Input -->
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UIcon name="heroicons:magnifying-glass" class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search artefacts..."
              class="block w-full pl-10 pr-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <!-- Category Filter -->
        <div class="lg:w-48">
          <USelect
            v-model="selectedCategory"
            :options="[
              { label: 'All Categories', value: '' },
              ...availableCategories.map(cat => ({ label: cat, value: cat }))
            ]"
            placeholder="All Categories"
            size="lg"
          />
        </div>

        <!-- Type Filter -->
        <div class="lg:w-48">
          <select
            v-model="selectedType"
            class="block w-full px-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Types</option>
            <option value="PDF">PDF</option>
            <option value="Word">Word</option>
            <option value="Markdown">Markdown</option>
            <option value="TXT">TXT</option>
            <option value="CSV">CSV</option>
            <option value="Image">Image</option>
            <option value="Database">Database</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="lg:w-48">
          <select
            v-model="selectedStatus"
            class="block w-full px-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Status</option>
            <option value="processed">Processed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Artefacts Table -->
    <div class="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
      <!-- Table Header -->
      <div class="px-6 py-4 border-b border-dark-700">
        <h2 class="text-lg font-semibold text-white">All Artefacts</h2>
        <p class="text-gray-400 text-sm">
          Manage your uploaded artefacts and view their processing status and AI-generated
          summaries.
        </p>
      </div>

      <!-- UTable -->
      <UTable
        :rows="filteredArtefacts"
        :columns="columns"
        :loading="false"
        :sort="{ column: 'lastUpdated', direction: 'desc' }"
        class="divide-y divide-dark-700"
        :ui="{
          wrapper: 'relative overflow-x-auto',
          base: 'min-w-full table-fixed',
          thead: 'bg-dark-900',
          tbody: 'bg-dark-800 divide-y divide-dark-700 [&>tr:hover]:bg-dark-700/50',
          tr: {
            base: '',
            selected: 'bg-dark-700/50',
            active: '',
          },
          th: {
            base: 'text-left rtl:text-right',
            padding: 'px-6 py-3',
            color: 'text-gray-400',
            font: 'font-medium text-xs',
            size: 'text-xs',
          },
          td: {
            base: 'whitespace-nowrap',
            padding: 'px-6 py-4',
            color: 'text-gray-300',
            font: '',
            size: 'text-sm',
          },
        }"
      >
        <!-- Artefact column with icon and description -->
        <template #artefact-data="{ row }">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <UIcon name="heroicons:document-text" class="w-5 h-5 text-blue-400" />
            </div>
            <div class="ml-3">
              <div class="text-sm font-medium text-white">{{ row.name }}</div>
              <div class="text-sm text-gray-400">{{ row.description }}</div>
            </div>
          </div>
        </template>

        <!-- Category column with badge -->
        <template #category-data="{ row }">
          <span
            class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            :class="getCategoryColor(row.category)"
          >
            {{ row.category }}
          </span>
        </template>

        <!-- Status column with badge and dot -->
        <template #status-data="{ row }">
          <span
            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
            :class="getStatusColor(row.status)"
          >
            <div class="w-1.5 h-1.5 rounded-full mr-1" :class="getStatusDotColor(row.status)"></div>
            {{ capitalizeStatus(row.status) }}
          </span>
        </template>

        <!-- Summary column with button -->
        <template #summary-data="{ row }">
          <UButton
            @click="viewSummary(row)"
            variant="ghost"
            size="sm"
            icon="heroicons:document-magnifying-glass"
            color="blue"
            class="text-blue-400 hover:text-blue-300"
          >
            View Summary
          </UButton>
        </template>

        <!-- Actions column with action buttons -->
        <template #actions-data="{ row }">
          <div class="flex items-center space-x-2">
            <button
              @click="viewArtefact(row)"
              class="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <UIcon name="heroicons:eye" class="w-4 h-4" />
            </button>
            <button
              @click="downloadArtefact(row)"
              class="text-green-400 hover:text-green-300 transition-colors"
            >
              <UIcon name="heroicons:arrow-path-rounded-square" class="w-4 h-4" />
            </button>
            <button
              @click="deleteArtefact(row)"
              class="text-red-400 hover:text-red-300 transition-colors"
            >
              <UIcon name="heroicons:trash" class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Upload Modal -->
    <UModal
      v-model="showUploadModal"
      prevent-close
      :ui="{ width: 'sm:max-w-4xl' }"
      :disabled="disabledControl"
      :class="{ 'disabled-modal': disabledControl }"
    >
      <div class="p-8">
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-dark-600">
          <div>
            <h3 class="text-xl font-semibold text-white">Please choose an upload method:</h3>
          </div>
          <UButton
            @click="showUploadModal = false"
            variant="ghost"
            icon="heroicons:x-mark"
            color="gray"
            size="md"
            :disabled="isUploading"
            class="hover:bg-dark-700"
          />
        </div>

        <!-- Upload Method Tabs -->
        <div class="mb-6">
          <UTabs v-model="uploadType" :items="tabItems">

            <template #file>
              <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-6">
                <!-- File Category - First Position -->
                <UFormGroup label="File Category" name="category" required>
                  <UInputMenu
                    v-model="state.category"
                    :options="categoryOptions"
                    placeholder="Select a Category or Add a new one"
                    :loading="isUploading"
                    searchable
                    :disabled="isUploading"
                    value-attribute="label"
                    :uiMenu="{
                      option: {
                        container: 'flex items-center w-full',
                      },
                    }"
                  >
                    <template #option="{ option: category }">
                      <div class="relative flex items-center w-full p-2 pr-0">
                        <span class="truncate">{{ category.label }}</span>

                        <!-- Fully interactive button wrapper -->
                        <div
                          class="absolute right-2"
                          style="pointer-events: auto"
                          @mousedown.stop.prevent
                        >
                          <UButton
                            v-if="state.category !== category.label"
                            @click="deleteCategory(category.value)"
                            :ui="{ rounded: 'rounded-full' }"
                            icon="i-heroicons:trash"
                            variant="outline"
                            color="red"
                            size="xs"
                            :loading="isUploading"
                            :disabled="isUploading"
                          />
                        </div>
                      </div>
                    </template>
                    <template #option-empty="{ query }">
                      <div class="flex items-center justify-between w-full p-2">
                        <span class="text-gray-500">
                          <q>{{ query }}</q> category not found! Want to add?
                        </span>
                        <UButton
                          @click="addCategory(query)"
                          color="primary"
                          size="xs"
                          :loading="isUploading"
                          :disabled="isUploading"
                        >
                          Add
                        </UButton>
                      </div>
                    </template>
                    <template #empty>
                      No categories found
                    </template>
                  </UInputMenu>
                </UFormGroup>

                <!-- Drag and Drop File Upload -->
                <UFormGroup label="File" name="file" required>
                  <div
                    @drop.prevent="handleDrop"
                    @dragover.prevent="handleDragOver"
                    @dragenter.prevent="handleDragEnter"
                    @dragleave.prevent="handleDragLeave"
                    class="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center transition-colors relative"
                    :class="{
                      'border-blue-500 bg-blue-500/10': isDragOver,
                      'border-green-500 bg-green-500/10': state.file,
                      'hover:border-dark-500': !isDragOver && !state.file
                    }"
                  >
                    <div v-if="!state.file" class="py-4">
                      <UIcon name="heroicons:cloud-arrow-up" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p class="text-lg text-gray-300 mb-2">
                        <span class="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p class="text-sm text-gray-400 mb-4">
                        PDF, Word, TXT, CSV, Markdown, Images
                      </p>
                      <p class="text-xs text-gray-500">
                        Maximum file size: 20MB
                      </p>
                      <input
                        ref="fileInput"
                        type="file"
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx,.txt,.csv,.md,.png,.jpg,.jpeg"
                        @change="handleFileSelect"
                      />
                    </div>
                    <div v-else class="flex items-center justify-between py-4">
                      <div class="flex items-center space-x-4">
                        <UIcon name="heroicons:document" class="w-10 h-10 text-green-400" />
                        <div class="text-left">
                          <p class="text-white font-medium truncate max-w-md">{{ state.file.name }}</p>
                          <p class="text-sm text-gray-400">{{ formatFileSize(state.file.size) }} • {{ getFileType(state.file.name) }}</p>
                        </div>
                      </div>
                      <UButton
                        @click="removeFile"
                        variant="ghost"
                        icon="heroicons:x-mark"
                        color="red"
                        size="md"
                      />
                    </div>
                  </div>
                </UFormGroup>

                <!-- Description -->
                <UFormGroup label="Description (Optional)" name="description">
                  <UTextarea
                    v-model="state.description"
                    placeholder="Brief description (max 100 characters)"
                    :maxlength="100"
                    :rows="3"
                    size="lg"
                  />
                  <p class="text-xs text-gray-400 mt-1">
                    {{ state.description?.length || 0 }}/100 characters
                  </p>
                </UFormGroup>

                <div class="flex justify-end space-x-3 pt-6 border-t border-dark-600 mt-6">
                  <UButton
                    @click="showUploadModal = false"
                    :disabled="isUploading"
                    variant="outline"
                    color="gray"
                    size="lg"
                    class="min-w-[120px]"
                  >
                    Cancel
                  </UButton>
                  <UButton
                    type="submit"
                    :loading="isUploading"
                    :disabled="isUploading"
                    color="primary"
                    size="lg"
                    class="min-w-[120px]"
                    icon="heroicons:cloud-arrow-up"
                  >
                    {{ isUploading ? 'Uploading...' : 'Upload' }}
                  </UButton>
                </div>
              </UForm>
            </template>

            <template #google>
              <div class="space-y-6">
                <!-- File Category - First Position -->
                <UFormGroup label="File Category" required>
                  <UInputMenu
                    v-model="googleDriveState.category"
                    :options="categoryOptions"
                    placeholder="Select a Category or Add a new one"
                    :loading="isUploadingFromGoogleDrive"
                    searchable
                    :disabled="isUploadingFromGoogleDrive"
                    value-attribute="label"
                    :uiMenu="{
                      option: {
                        container: 'flex items-center w-full',
                      },
                    }"
                  >
                    <template #option="{ option: category }">
                      <div class="relative flex items-center w-full p-2 pr-0">
                        <span class="truncate">{{ category.label }}</span>

                        <!-- Fully interactive button wrapper -->
                        <div
                          class="absolute right-2"
                          style="pointer-events: auto"
                          @mousedown.stop.prevent
                        >
                          <UButton
                            v-if="googleDriveState.category !== category.label"
                            @click="deleteCategory(category.value)"
                            :ui="{ rounded: 'rounded-full' }"
                            icon="i-heroicons:trash"
                            variant="outline"
                            color="red"
                            size="xs"
                            :loading="isUploadingFromGoogleDrive"
                            :disabled="isUploadingFromGoogleDrive"
                          />
                        </div>
                      </div>
                    </template>
                    <template #option-empty="{ query }">
                      <div class="flex items-center justify-between w-full p-2">
                        <span class="text-gray-500">
                          <q>{{ query }}</q> category not found! Want to add?
                        </span>
                        <UButton
                          @click="addCategory(query)"
                          color="primary"
                          size="xs"
                          :loading="isUploadingFromGoogleDrive"
                          :disabled="isUploadingFromGoogleDrive"
                        >
                          Add
                        </UButton>
                      </div>
                    </template>
                    <template #empty>
                      No categories found
                    </template>
                  </UInputMenu>
                </UFormGroup>

          <!-- Google Drive URL -->
          <UFormGroup label="Google drive public URL">
            <div class="flex space-x-2">
              <input
                v-model="googleDriveState.url"
                type="url"
                placeholder="Google drive URL eg: https://drive.google.com/drive/folders/1UMPf5gDy_mCW4v"
                class="flex-1 px-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <UButton
                @click="fetchGoogleDriveFiles"
                :loading="isFetchingFiles"
                color="primary"
                size="lg"
                class="min-w-[100px]"
              >
                Fetch Files
              </UButton>
              <UButton
                @click="uploadFromGoogleDrive"
                :disabled="googleDriveFiles.length === 0 || isUploadingFromGoogleDrive"
                :loading="isUploadingFromGoogleDrive"
                color="blue"
                size="lg"
                class="min-w-[180px]"
              >
                Upload from Google Drive
              </UButton>
            </div>
          </UFormGroup>

          <!-- Note -->
          <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <UIcon name="heroicons:information-circle" class="w-5 h-5 text-blue-400 mt-0.5" />
              <div class="text-sm text-blue-300">
                <p class="font-medium mb-1">Note:</p>
                <p>By signing in, you allow us to access your Google Drive and download selected files to our server. Your files are not stored or shared beyond this process.</p>
                <p class="mt-2">Supported file types: CSV, MS Word, PDF, Markdown, and Text files</p>
              </div>
            </div>
          </div>

          <!-- Files Table -->
          <div class="border border-dark-700 rounded-lg overflow-hidden">
            <div class="bg-dark-900 px-4 py-3 border-b border-dark-700">
              <div class="grid grid-cols-3 gap-4 text-sm font-medium text-gray-400">
                <div>Name</div>
                <div>File Type</div>
                <div>Size</div>
              </div>
            </div>

            <div class="bg-dark-800 min-h-[200px] flex items-center justify-center">
              <div v-if="googleDriveFiles.length === 0" class="text-center py-8">
                <UIcon name="heroicons:folder-open" class="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p class="text-gray-400 text-sm">No files available for selection.</p>
              </div>
              <div v-else class="w-full">
                <div
                  v-for="file in googleDriveFiles"
                  :key="file.id"
                  class="px-4 py-3 border-b border-dark-700 hover:bg-dark-700/50 transition-colors"
                >
                  <div class="grid grid-cols-3 gap-4 text-sm">
                    <div class="text-white font-medium">{{ file.name }}</div>
                    <div class="text-gray-400">{{ file.type }}</div>
                    <div class="text-gray-400">{{ file.size }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

                <!-- Bottom Actions -->
                <div class="flex justify-end space-x-3 pt-6 border-t border-dark-600 mt-6">
                  <UButton
                    @click="showUploadModal = false"
                    :disabled="isUploadingFromGoogleDrive"
                    variant="outline"
                    color="gray"
                    size="lg"
                    class="min-w-[120px]"
                  >
                    Cancel
                  </UButton>
                  <UButton
                    @click="uploadFromGoogleDrive"
                    :disabled="googleDriveFiles.length === 0 || isUploadingFromGoogleDrive"
                    :loading="isUploadingFromGoogleDrive"
                    color="primary"
                    size="lg"
                    class="min-w-[120px]"
                    icon="heroicons:cloud-arrow-up"
                  >
                    {{ isUploadingFromGoogleDrive ? 'Uploading...' : 'Upload' }}
                  </UButton>
                </div>
              </div>
            </template>
          </UTabs>
        </div>
      </div>
    </UModal>

    <!-- Summary Modal -->
    <UModal v-model="showSummaryModal" :ui="{ width: 'sm:max-w-2xl' }">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <UIcon name="heroicons:document-text" class="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">{{ selectedArtefact?.name }}</h3>
              <p class="text-sm text-gray-400">{{ selectedArtefact?.description }}</p>
            </div>
          </div>
          <UButton
            @click="showSummaryModal = false"
            variant="ghost"
            icon="heroicons:x-mark"
            color="gray"
            size="sm"
          />
        </div>

        <div class="mb-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-400">Category:</span>
            <span class="ml-2 text-white">{{ selectedArtefact?.category }}</span>
          </div>
          <div>
            <span class="text-gray-400">Type:</span>
            <span class="ml-2 text-white">{{ selectedArtefact?.type }}</span>
          </div>
          <div>
            <span class="text-gray-400">Size:</span>
            <span class="ml-2 text-white">{{ selectedArtefact?.size }}</span>
          </div>
          <div>
            <span class="text-gray-400">Status:</span>
            <span
              class="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
              :class="getStatusColor(selectedArtefact?.status)"
            >
              <div
                class="w-1.5 h-1.5 rounded-full mr-1"
                :class="getStatusDotColor(selectedArtefact?.status)"
              ></div>
              {{ capitalizeStatus(selectedArtefact?.status || '') }}
            </span>
          </div>
        </div>

        <div class="border-t border-dark-700 pt-4">
          <h4 class="text-sm font-medium text-white mb-3">AI-Generated Summary</h4>
          <div class="bg-dark-700 rounded-lg p-4">
            <p class="text-gray-300 text-sm leading-relaxed">
              {{
                selectedArtefact?.status === 'processed'
                  ? `This ${selectedArtefact?.type} document contains comprehensive information about ${selectedArtefact?.category.toLowerCase()} matters. The AI analysis reveals key insights and important data points that can be leveraged for decision-making processes. Based on the document structure and content patterns, this artefact provides valuable resource material for organizational operations and strategic planning.`
                  : 'Summary is not available yet. The document is still being processed by our AI system. Please check back once the processing is complete.'
              }}
            </p>
          </div>
        </div>

        <div class="flex justify-end mt-6 space-x-3">
          <UButton @click="showSummaryModal = false" variant="ghost" color="gray"> Close </UButton>
          <UButton
            @click="downloadArtefact(selectedArtefact)"
            icon="heroicons:arrow-down-tray"
            color="primary"
          >
            Download
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '~/utils'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

// Using admin layout
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

// Form validation schema
const schema = z.object({
  file: z.any().refine((file) => file !== null, 'File is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().max(100, 'Description must be 100 characters or less').optional(),
})

type Schema = z.output<typeof schema>

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const showUploadModal = ref(false)
const showSummaryModal = ref(false)
const selectedArtefact = ref(null)
const uploadProgress = ref(0)
const isUploading = ref(false)

// Upload type - default to file upload (0 = file, 1 = google)
const uploadType = ref(0)

// Tab items for UTabs
const tabItems = [
  {
    value: 0,
    slot: 'file',
    label: 'File Upload',
    icon: 'i-heroicons-document'
  },
  {
    value: 1,
    slot: 'google',
    label: 'Google Drive',
    icon: 'i-logos-google-drive'
  }
]

// Categories management
const availableCategories = ref([
  'HR Policy',
  'Financial',
  'Technical',
  'Analytics',
  'Legal & Compliance',
  'Policies & Procedures',
  'Product / Service Information',
  'Technical / Operational Documentation',
  'Training & Onboarding'
])

// Google Drive state
const googleDriveState = reactive({
  category: '',
  url: '',
})

const googleDriveFiles = ref([])
const isFetchingFiles = ref(false)
const isUploadingFromGoogleDrive = ref(false)

// Form state for UForm
const state = reactive({
  file: null as File | null,
  category: '',
  description: '',
})

// Drag and drop state
const isDragOver = ref(false)
const dragCounter = ref(0)

// Modal control states
const isViewMode = ref(false)
const disabledControl = ref(false)

// Table columns configuration
const columns = [
  {
    key: 'artefact',
    label: 'Artefact',
    sortable: true,
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
  },
  {
    key: 'size',
    label: 'Size',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
  },
  {
    key: 'uploadedBy',
    label: 'Uploaded By',
    sortable: true,
  },
  {
    key: 'lastUpdated',
    label: 'Last Updated',
    sortable: true,
  },
  {
    key: 'summary',
    label: 'Summary',
    sortable: false,
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
  },
]

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

// Category options for USelectMenu
const categoryOptions = computed(() => {
  return availableCategories.value.map(category => ({
    label: category,
    value: category,
    deletable: true
  }))
})

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
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'HR Policy': 'bg-blue-500/20 text-blue-400',
    Financial: 'bg-green-500/20 text-green-400',
    Technical: 'bg-purple-500/20 text-purple-400',
    Analytics: 'bg-orange-500/20 text-orange-400',
  }
  return colors[category] || 'bg-gray-500/20 text-gray-400'
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    processed: 'bg-green-500/20 text-green-400',
    processing: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400',
  }
  return colors[status] || 'bg-gray-500/20 text-gray-400'
}

const getStatusDotColor = (status: string) => {
  const colors: Record<string, string> = {
    processed: 'bg-green-400',
    processing: 'bg-yellow-400',
    failed: 'bg-red-400',
  }
  return colors[status] || 'bg-gray-400'
}

const capitalizeStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

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

// File input ref
const fileInput = ref<HTMLInputElement>()

// Drag and drop handlers
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value++
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragOver.value = false
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  dragCounter.value = 0

  const files = e.dataTransfer?.files
  if (files && files[0]) {
    setFile(files[0])
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    setFile(target.files[0])
  }
}

const setFile = (file: File) => {
  // Validate file size (20MB limit)
  if (file.size > 20 * 1024 * 1024) {
    alert('File size must be less than 20MB')
    return
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv', 'text/markdown', 'image/png', 'image/jpeg', 'image/jpg']
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
    alert('Unsupported file type. Please upload PDF, Word, TXT, CSV, Markdown, or Image files.')
    return
  }

  state.file = file
}

const removeFile = () => {
  state.file = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const getFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    txt: 'TXT',
    csv: 'CSV',
    md: 'Markdown',
    png: 'Image',
    jpg: 'Image',
    jpeg: 'Image',
  }
  return typeMap[extension || ''] || 'Unknown'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'kB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// UForm submission handler
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    isUploading.value = true
    uploadProgress.value = 0

    // Create new artefact object
    const newId = Math.max(...artefacts.value.map(a => a.id)) + 1
    const newArt = {
      id: newId,
      name: event.data.file.name,
      description: event.data.description || 'No description provided',
      category: event.data.category,
      type: getFileType(event.data.file.name),
      size: formatFileSize(event.data.file.size),
      status: 'processing' as const,
      uploadedBy: 'Current User', // Would be from auth context
      lastUpdated: formatDateTime(new Date()),
      artefact: event.data.file.name,
    }

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 100) {
        clearInterval(progressInterval)

        // Add to artefacts list
        artefacts.value.unshift(newArt)

        // Reset upload state
        isUploading.value = false
        showUploadModal.value = false

        // After 2 seconds, mark as processed
        setTimeout(() => {
          const uploadedArtefact = artefacts.value.find(a => a.id === newId)
          if (uploadedArtefact) {
            uploadedArtefact.status = 'processed'
          }
        }, 2000)
      }
    }, 200) // Slower for better UX

    // Reset form
    state.file = null
    state.category = ''
    state.description = ''

    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    console.log('Upload started for:', newArt.name)

  } catch (error) {
    console.error('Upload failed:', error)
    alert('Upload failed. Please try again.')
    isUploading.value = false
  }
}

// Google Drive methods
const fetchGoogleDriveFiles = async () => {
  if (!googleDriveState.url) {
    alert('Please enter a Google Drive URL')
    return
  }

  try {
    isFetchingFiles.value = true

    // Simulate API call to fetch Google Drive files
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock files data
    googleDriveFiles.value = [
      {
        id: '1',
        name: 'Company Policy 2024.pdf',
        type: 'PDF',
        size: '2.4 MB'
      },
      {
        id: '2',
        name: 'Employee Guidelines.docx',
        type: 'Word',
        size: '1.2 MB'
      },
      {
        id: '3',
        name: 'Budget Report.csv',
        type: 'CSV',
        size: '890 kB'
      }
    ]

  } catch (error) {
    console.error('Failed to fetch files:', error)
    alert('Failed to fetch files from Google Drive. Please check the URL and try again.')
  } finally {
    isFetchingFiles.value = false
  }
}

const uploadFromGoogleDrive = async () => {
  if (!googleDriveState.category) {
    alert('Please select a category')
    return
  }

  if (googleDriveFiles.value.length === 0) {
    alert('No files available to upload')
    return
  }

  try {
    isUploadingFromGoogleDrive.value = true

    // Simulate upload process for each file
    for (const file of googleDriveFiles.value) {
      const newId = Math.max(...artefacts.value.map(a => a.id)) + 1
      const newArt = {
        id: newId,
        name: file.name,
        description: `Uploaded from Google Drive`,
        category: googleDriveState.category,
        type: file.type,
        size: file.size,
        status: 'processing' as const,
        uploadedBy: 'Current User',
        lastUpdated: formatDateTime(new Date()),
        artefact: file.name,
      }

      artefacts.value.unshift(newArt)

      // Mark as processed after a delay
      setTimeout(() => {
        const uploadedArtefact = artefacts.value.find(a => a.id === newId)
        if (uploadedArtefact) {
          uploadedArtefact.status = 'processed'
        }
      }, 2000)
    }

    // Reset Google Drive state
    googleDriveState.category = ''
    googleDriveState.url = ''
    googleDriveFiles.value = []

    // Close modal
    showUploadModal.value = false

    console.log('Files uploaded from Google Drive')

  } catch (error) {
    console.error('Upload from Google Drive failed:', error)
    alert('Upload failed. Please try again.')
  } finally {
    isUploadingFromGoogleDrive.value = false
  }
}

// Category management methods
const addCategory = (category: string) => {
  const trimmedCategory = category.trim()
  if (trimmedCategory && !availableCategories.value.includes(trimmedCategory)) {
    availableCategories.value.push(trimmedCategory)
    // Auto-select the newly added category
    state.category = trimmedCategory
    googleDriveState.category = trimmedCategory
  }
}

const deleteCategory = (category: string) => {
  const index = availableCategories.value.indexOf(category)
  if (index > -1) {
    availableCategories.value.splice(index, 1)

    // Clear the selected category if it was deleted
    if (state.category === category) {
      state.category = ''
    }
    if (googleDriveState.category === category) {
      googleDriveState.category = ''
    }

    // Update any existing artefacts that use this category
    artefacts.value.forEach(artefact => {
      if (artefact.category === category) {
        artefact.category = 'Uncategorized'
      }
    })
  }
}

// Reset all form fields
const resetAllFields = () => {
  // Reset file upload form
  state.file = null
  state.category = ''
  state.description = ''

  // Reset Google Drive form
  googleDriveState.category = ''
  googleDriveState.url = ''
  googleDriveFiles.value = []

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }

  // Reset loading states
  isFetchingFiles.value = false
  isUploadingFromGoogleDrive.value = false
}

// Watch for tab changes and reset fields
watch(uploadType, () => {
  resetAllFields()
})

// Reset modal state when opening
watch(showUploadModal, (newVal) => {
  if (newVal) {
    uploadType.value = 0  // 0 = file upload tab
  }
})

useHead({
  title: 'Artefact Management - Admin Dashboard',
})
</script>
