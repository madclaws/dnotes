import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-static'
import * as sass from 'sass'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({
    postcss: true,
    sass: {
      sync: true,
      implementation: sass
    }
  }),
  kit: {
    adapter: adapter({
      fallback: 'index.html'
    })
  }
}

export default config
