<script lang="ts">
  import { onDestroy } from 'svelte'

  import { filesystemStore, sessionStore } from '$src/stores'
  import { AREAS, galleryStore, noteSpaceStore } from '$routes/notes/stores'
  import {getImagesFromWNFS, uploadNoteToWNFS, type Image, getNotesFromWNFS, deleteNoteFromWNFS}  from '$routes/notes/lib/gallery'
  import FileUploadCard from '$routes/notes/components/upload/FileUploadCard.svelte'
  import ImageCard from '$routes/notes/components/imageGallery/ImageCard.svelte'
  import ImageModal from '$routes/notes/components/imageGallery/ImageModal.svelte'

  import Note from '$routes/notes/components/Note.svelte'
  import EditNoteModal from '$routes/notes/components/EditNoteModal.svelte'
  import DeleteNoteModal from '$routes/notes/components/DeleteNoteModal.svelte'
  import type { NoteType } from '$routes/notes/lib/utils'
  import Fa from 'svelte-fa/src/fa.svelte'
  import { faPlus } from '@fortawesome/free-solid-svg-icons'
  import Modal from '$routes/notes/components/Modal.svelte'

  /**
   * Open the ImageModal and pass it the selected `image` from the gallery
   * @param image
   */
  let selectedImage: Image
  const setSelectedImage: (image: Image) => void = image =>
    (selectedImage = image)

  const clearSelectedImage = () => (selectedImage = null)

  // If galleryStore.selectedArea changes from private to public, re-run getImagesFromWNFS
  let selectedArea = null
  const unsubscribeGalleryStore = noteSpaceStore.subscribe(async updatedStore => {
    // Get initial selectedArea
    if (!selectedArea) {
      selectedArea = updatedStore.selectedArea
    }

    if (selectedArea !== updatedStore.selectedArea) {
      selectedArea = updatedStore.selectedArea
      await getNotesFromWNFS()
    }
  })

  let nope = false
  // Once the user has been authed, fetch the images from their file system
  let imagesFetched = false
  const unsubscribeSessionStore = sessionStore.subscribe((newState) => {
    if (newState.session && $filesystemStore && !imagesFetched) {
      imagesFetched = true
      // Get images from the user's public WNFS
      // if (nope) {
        // getImagesFromWNFS()
        getNotesFromWNFS();
      // }
    }
  })

  onDestroy(() => {
    unsubscribeGalleryStore()
    unsubscribeSessionStore()
  })

  let notesJSONString: string = localStorage.getItem('notes')

let notes: Array<NoteType> = []

if (notesJSONString) {
  try {
    notes = JSON.parse(notesJSONString) as NoteType[]
  } catch (err) {
    console.error(err)
  }
}

// editing

let noteToEdit: NoteType | Record<string, unknown> | undefined
let showEditModal = false

const openEditNote = (note?: NoteType) => {
  noteToEdit = {}
  if (note) {
    noteToEdit = note
  }
  showEditModal = true
}

const closeEditModal = () => {
  noteToEdit = {}
  showEditModal = false
}

let noteToDelete: NoteType | Record<string, unknown> | undefined
let showDeleteModal = false

const openDeleteNote = (event: CustomEvent) => {
  const deleteNoteIndex = event.detail as number
  let noteIndex;
  let src;
  if ($noteSpaceStore.selectedArea == "Public") {
    noteIndex = $noteSpaceStore.publicNotes.findIndex(item => item.src.id === deleteNoteIndex)
    src = $noteSpaceStore.publicNotes[noteIndex].src;
  } else {
    noteIndex = $noteSpaceStore.privateNotes.findIndex(item => item.src.id === deleteNoteIndex)
    src = $noteSpaceStore.privateNotes[noteIndex].src;
  }
  if (noteIndex !== -1) {
    noteToDelete = src
    showDeleteModal = true
  }
}

const closeDeleteModal = () => {
  noteToDelete = {}
  showDeleteModal = false
}

const saveNotesToStorage = () => {
  // for reactivity purposes
  notes = notes
  // save it in the local storage
  localStorage.setItem('notes', JSON.stringify(notes))
}

const toggleFavorite = async (event: CustomEvent) => {
  const noteId: number = (event.detail as number)
  let note: NoteType = null;
  if ($noteSpaceStore.selectedArea == "Public") {
    note = $noteSpaceStore.publicNotes.find(item => item.src.id === noteId).src;
  } else {
    note = $noteSpaceStore.privateNotes.find(item => item.src.id === noteId).src;
  }
  if (note) {
    note.isFavorite = !note.isFavorite
    await uploadNoteToWNFS(note);
  }
}

const saveNote = async (event: CustomEvent) => {
  closeEditModal()
  const note = event.detail as NoteType
  const noteIndex = notes.findIndex(item => item.id === note.id)
  
  if (noteIndex !== -1) {
    notes[noteIndex] = note    
  } else {
    notes.push(note)
  }
  await uploadNoteToWNFS(note);
  // saveNotesToStorage()
}

const deleteNote  = (event: CustomEvent) => {
  closeDeleteModal()
  closeEditModal()
  const deleteNoteIndex = event.detail as number
  let noteIndex;
  let name;

  if ($noteSpaceStore.selectedArea == "Public") {
    noteIndex = $noteSpaceStore.publicNotes.findIndex(item => item.src.id === deleteNoteIndex)
    name = $noteSpaceStore.publicNotes[noteIndex].src.title;
  } else {
    noteIndex = $noteSpaceStore.privateNotes.findIndex(item => item.src.id === deleteNoteIndex)
    name = $noteSpaceStore.privateNotes[noteIndex].src.title;
  }
  
  if (noteIndex !== -1) {
    deleteNoteFromWNFS(name);
  }
  // saveNotesToStorage()
}
</script>

<section class="overflow-hidden text-gray-700">
  <div class="pt-8 p-6 md:p-8 mx-auto">
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:lg:grid-cols-6 gap-4"
    >
      <!-- <FileUploadCard />
      {#each $noteSpaceStore.selectedArea === AREAS.PRIVATE ? $noteSpaceStore.privateNotes : $noteSpaceStore.publicNotes }
        <ImageCard {image} openModal={setSelectedImage} />
      {/each} -->
      <!-- <div class="note-card-container"> -->
        <div class="note-card-add" on:click="{() => { openEditNote() }}">
          <Fa icon={faPlus} color="#afaeae" size="3x" />
        </div>
          {#each $noteSpaceStore.selectedArea === AREAS.PRIVATE ? $noteSpaceStore.privateNotes : $noteSpaceStore.publicNotes as note (note.cid) }
          <Note
            {...note.src}
            on:click="{() => { openEditNote(note.src)}}"
            on:toggleFavorite="{toggleFavorite}"
          />
          {/each}
         
    
        <!-- {#if notes.length > 0}
        {#each notes as note (note.id)}
          <Note
            {...note}
            on:click="{() => { openEditNote(note) }}"
            on:toggleFavorite="{toggleFavorite}"
          />
        {/each}
        {/if} -->
      <!-- </div> -->
    </div>
  </div>

  <!-- {#if selectedImage}
    <ImageModal
      image={selectedImage}
      isModalOpen={!!selectedImage}
      on:close={clearSelectedImage}
    />
  {/if} -->

  {#if showEditModal}
  <EditNoteModal
    {...noteToEdit}
    on:save="{saveNote}"
    on:delete="{openDeleteNote}"
    on:close="{closeEditModal}"
  />
{/if}

{#if showDeleteModal}
  {console.log(showDeleteModal)}
  <DeleteNoteModal
    {...noteToDelete}
    on:delete="{deleteNote}"
    on:close="{closeDeleteModal}"
  />
{/if}
</section>

<style lang="scss">
    main {
    padding: 2em;
    margin: 0 auto;
    width: 100vw;
    box-sizing: border-box;
  }

  .note-card {
    &-add {
      background-color: #d6d4d4;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: none;
      border: 4px dashed #a29f9f;
      width: 144px;
      height: 189px;
      color: #a29f9f;
      margin-right: 15px;
      padding: 15px;
      border-radius: 10px;
      &:hover {
        background-color: #c5c5c5;
      }
    }
    &-container {
      display: flex;
    }
  }
</style>