<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Save, Image, DollarSign, Tag, FileText } from 'lucide-svelte';
  import { toasts } from '$lib/stores';
  import type { Project } from '$lib/types';

  export let isOpen = false;
  export let project: Project | null = null;
  export let title = 'Create New Project';

  const dispatch = createEventDispatcher();

  let formData = {
    title: '',
    description: '',
    target_amount: '',
    image_url: '',
    category: '',
    status: 'active'
  };

  let errors: Record<string, string> = {};
  let submitting = false;
  let selectedFile: File | null = null;
  let imagePreview: string | null = null;
  let uploadingImage = false;

  const categories = [
    'Education',
    'Healthcare',
    'Environment',
    'Community Development',
    'Emergency Relief',
    'Technology',
    'Arts & Culture',
    'Sports & Recreation'
  ];

  // Reset form when modal opens/closes or project changes
  $: if (isOpen) {
    resetForm();
  }

  function resetForm() {
    if (project) {
      formData = {
        title: project.title,
        description: project.description,
        target_amount: project.target_amount.toString(),
        image_url: project.image_url || '',
        category: project.category,
        status: project.status
      };
      // Set preview for existing project image
      imagePreview = project.image_url || null;
    } else {
      formData = {
        title: '',
        description: '',
        target_amount: '',
        image_url: '',
        category: '',
        status: 'active'
      };
      imagePreview = null;
    }
    errors = {};
    selectedFile = null;
  }

  function validateForm(): boolean {
    errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Project title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Project description is required';
    }

    if (!formData.target_amount) {
      errors.target_amount = 'Target amount is required';
    } else {
      const amount = parseFloat(formData.target_amount);
      if (isNaN(amount) || amount <= 0) {
        errors.target_amount = 'Target amount must be a positive number';
      }
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    // Log validation state for debugging
    console.log('Form validation:', {
      hasSelectedFile: !!selectedFile,
      selectedFileName: selectedFile?.name,
      hasImagePreview: !!imagePreview,
      currentImageUrl: formData.image_url
    });

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    try {
      submitting = true;

      // Step 1: Upload image first if a new file is selected
      let imageUrl = formData.image_url; // Keep existing URL for edits

      console.log('Before upload check:', {
        hasSelectedFile: !!selectedFile,
        selectedFileName: selectedFile?.name,
        currentImageUrl: imageUrl
      });

      if (selectedFile) {
        console.log('Starting image upload for file:', selectedFile.name);
        toasts.add({
          type: 'info',
          message: 'Uploading image...'
        });

        const uploadedUrl = await uploadImage();
        console.log('Upload result:', uploadedUrl);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('Image URL set to:', imageUrl);
          toasts.add({
            type: 'success',
            message: 'Image uploaded successfully!'
          });
        } else {
          // If image upload fails, don't proceed
          console.error('Image upload failed');
          toasts.add({
            type: 'error',
            message: 'Image upload failed. Please try again.'
          });
          submitting = false;
          return;
        }
      } else {
        console.log('No file selected for upload');
      }

      // Step 2: Create/update project with confirmed image URL
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        target_amount: parseFloat(formData.target_amount),
        image_url: imageUrl || null,
        category: formData.category,
        status: formData.status
      };

      console.log('Submitting project data:', projectData); // Debug log

      const url = project ? `/api/projects/${project.id}` : '/api/projects';
      const method = project ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const result = await response.json();

      if (response.ok) {
        toasts.add({
          type: 'success',
          message: `Project ${project ? 'updated' : 'created'} successfully!`
        });
        dispatch(project ? 'updated' : 'created', result);
        handleClose();
      } else {
        toasts.add({
          type: 'error',
          message: result.error || `Failed to ${project ? 'update' : 'create'} project`
        });
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      toasts.add({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      submitting = false;
    }
  }

  function handleClose() {
    dispatch('close');
  }



  function handleImageUpload(event: Event) {
    console.log('handleImageUpload called');
    const target = event.target as HTMLInputElement;
    console.log('Target:', target);
    const file = target.files?.[0];
    console.log('File from input:', file);

    if (file) {
      console.log('File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Show immediate feedback
      toasts.add({
        type: 'info',
        message: `File selected: ${file.name}`
      });

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toasts.add({
          type: 'error',
          message: 'Please select a valid image file (PNG, JPG, GIF, WebP)'
        });
        // Clear the input
        target.value = '';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toasts.add({
          type: 'error',
          message: 'Image size must be less than 5MB'
        });
        // Clear the input
        target.value = '';
        return;
      }

      selectedFile = file;
      console.log('selectedFile set to:', selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview = e.target?.result as string;
        console.log('Image preview created:', imagePreview ? 'SUCCESS' : 'FAILED');
        console.log('imagePreview length:', imagePreview?.length);
        toasts.add({
          type: 'success',
          message: 'Image preview created! Ready to upload.'
        });
      };
      reader.onerror = () => {
        toasts.add({
          type: 'error',
          message: 'Failed to read image file'
        });
      };
      reader.readAsDataURL(file);
    }
  }

  function removeImage() {
    selectedFile = null;
    imagePreview = null;
    formData.image_url = '';

    // Clear the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async function uploadImage(): Promise<string | null> {
    if (!selectedFile) return null;

    try {
      uploadingImage = true;

      console.log('Starting image upload...', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type
      });

      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: uploadFormData
      });

      const result = await response.json();
      console.log('Upload response:', result);

      if (response.ok && result.imageUrl) {
        console.log('Image uploaded successfully:', result.imageUrl);
        return result.imageUrl;
      } else {
        console.error('Upload failed:', result);
        toasts.add({
          type: 'error',
          message: result.error || 'Failed to upload image'
        });
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toasts.add({
        type: 'error',
        message: 'Network error during image upload'
      });
      return null;
    } finally {
      uploadingImage = false;
    }
  }
</script>

{#if isOpen}
  <!-- Modal Backdrop -->
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="project-form-title"
  >
    <!-- Invisible backdrop button for closing -->
    <button
      class="absolute inset-0 w-full h-full cursor-default"
      on:click={handleClose}
      on:keydown={(e) => e.key === 'Escape' && handleClose()}
      aria-label="Close modal"
      tabindex="-1"
    ></button>
    <!-- Modal Content -->
    <div
      class="relative bg-white dark:bg-dark-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col z-10"
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
        <h2 id="project-form-title" class="font-display text-xl font-semibold text-dark-900 dark:text-white">
          {title}
        </h2>
        <button
          on:click={handleClose}
          class="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors duration-200"
          aria-label="Close form"
        >
          <X class="w-5 h-5 text-dark-500 dark:text-dark-400" />
        </button>
      </div>

      <!-- Form -->
      <div class="flex-1 overflow-y-auto">
        <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-6">
        <!-- Project Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Project Title *
          </label>
          <div class="relative">
            <FileText class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              id="title"
              type="text"
              bind:value={formData.title}
              class="input-field pl-10"
              class:border-red-500={errors.title}
              placeholder="Enter project title"
              required
            />
          </div>
          {#if errors.title}
            <p class="text-red-600 text-sm mt-1">{errors.title}</p>
          {/if}
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            bind:value={formData.description}
            class="input-field min-h-[120px] resize-y"
            class:border-red-500={errors.description}
            placeholder="Describe the project, its goals, and impact..."
            required
          ></textarea>
          {#if errors.description}
            <p class="text-red-600 text-sm mt-1">{errors.description}</p>
          {/if}
        </div>

        <!-- Target Amount and Category -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Target Amount -->
          <div>
            <label for="target_amount" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Target Amount (KES) *
            </label>
            <div class="relative">
              <DollarSign class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                id="target_amount"
                type="number"
                bind:value={formData.target_amount}
                class="input-field pl-10"
                class:border-red-500={errors.target_amount}
                placeholder="0"
                min="1"
                step="1"
                required
              />
            </div>
            {#if errors.target_amount}
              <p class="text-red-600 text-sm mt-1">{errors.target_amount}</p>
            {/if}
          </div>

          <!-- Category -->
          <div>
            <label for="category" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Category *
            </label>
            <div class="relative">
              <Tag class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              <select
                id="category"
                bind:value={formData.category}
                class="input-field pl-10 pr-8 appearance-none"
                class:border-red-500={errors.category}
                required
              >
                <option value="">Select category</option>
                {#each categories as category}
                  <option value={category}>{category}</option>
                {/each}
              </select>
            </div>
            {#if errors.category}
              <p class="text-red-600 text-sm mt-1">{errors.category}</p>
            {/if}
          </div>
        </div>

        <!-- Image Upload -->
        <div>
          <label for="image-upload" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Project Image (Optional)
          </label>
          {#if imagePreview}
            <!-- Image Preview -->
            <div class="mb-3">
              <div class="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Project preview"
                  class="w-32 h-32 object-cover rounded-lg border border-dark-300 dark:border-dark-600"
                />
                <button
                  type="button"
                  on:click={removeImage}
                  class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  aria-label="Remove image"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
              <div class="mt-2">
                {#if selectedFile}
                  <p class="text-xs text-green-600 dark:text-green-400">
                    ✓ Image ready to upload: {selectedFile.name}
                  </p>
                {:else if formData.image_url}
                  <p class="text-xs text-blue-600 dark:text-blue-400">
                    ✓ Current image will be kept
                  </p>
                {/if}
              </div>
            </div>
          {/if}

          <!-- File Input -->
          <div class="relative">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              on:change={handleImageUpload}
              class="hidden"
            />
            <label
              for="image-upload"
              class="flex items-center justify-center w-full p-4 border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-200 cursor-pointer"
            >
              <div class="text-center">
                <Image class="w-8 h-8 text-dark-400 mx-auto mb-2" />
                <p class="text-sm text-dark-600 dark:text-dark-400">
                  {imagePreview ? 'Change image' : 'Click to upload image'}
                </p>
                <p class="text-xs text-dark-500 dark:text-dark-400 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </label>
          </div>
        </div>

        <!-- Status (only for editing) -->
        {#if project}
          <div>
            <label for="status" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Status
            </label>
            <select
              id="status"
              bind:value={formData.status}
              class="input-field"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        {/if}

        <!-- Submit Button -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            on:click={handleClose}
            class="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingImage}
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
          >
            {#if submitting || uploadingImage}
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>
                {#if uploadingImage}
                  Uploading image...
                {:else if submitting}
                  {project ? 'Updating...' : 'Creating...'}
                {/if}
              </span>
            {:else}
              <Save class="w-4 h-4" />
              <span>{project ? 'Update Project' : 'Create Project'}</span>
            {/if}
          </button>
        </div>
        </form>
      </div>
    </div>
  </div>
{/if}
