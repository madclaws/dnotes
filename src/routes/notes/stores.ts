import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'

import type { Gallery, NoteSpace } from '$routes/notes/lib/gallery'

export enum AREAS {
  PUBLIC = 'Public',
  PRIVATE = 'Private'
}

export const galleryStore: Writable<Gallery> = writable({
  loading: true,
  publicImages: [],
  privateImages: [],
  selectedArea: AREAS.PUBLIC
})

export const noteSpaceStore: Writable<NoteSpace> = writable({
  loading: true,
  publicNotes: [],
  privateNotes: [],
  selectedArea: AREAS.PUBLIC
})