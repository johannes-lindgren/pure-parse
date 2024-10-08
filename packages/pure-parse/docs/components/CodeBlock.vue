<script setup lang="ts">
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'
import { onMounted, ref } from 'vue'

// Then register the languages you need
hljs.registerLanguage('typescript', typescript)

const props = defineProps({
  code: String,
})

const codeEl = ref()
onMounted(() => {
  if (codeEl.value) {
    hljs.highlightElement(codeEl.value, { language: 'typescript' })
  }
})

const escapeHtml = (unsafe) =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
</script>

<template>
  <figure class="code-block">
    <figcaption class="code-block__caption"><slot name="caption" /></figcaption>
    <pre class="code-block__pre">
      <code
        class="code-block__code"
        ref="codeEl"
        v-html="escapeHtml(code.trim())"
      />
    </pre>
  </figure>
</template>

<style lang="scss">
@use 'sass:meta';

html:not(.dark) {
  @include meta.load-css('highlight.js/styles/github.min');
}

html.dark {
  @include meta.load-css('highlight.js/styles/github-dark.min');
}

.code-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.code-block__caption {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  padding: 0 4px;
  color: var(--vp-c-text-2);
}

.code-block__pre {
  display: flex;
  padding: 24px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 12px;
  height: fit-content;
  margin: 0;
}

.code-block__code {
  padding: 0 !important;
  background-color: transparent !important;
  height: fit-content !important;
}
</style>
