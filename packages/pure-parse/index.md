---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: PureParse
  text: Typesafe, lightweight parsers
  tagline: Type aliases as your source of truth
  actions:
    - theme: brand
      text: Getting Started
      link: /getting-started
    - theme: alt
      text: API Reference
      link: /api
features:
  - title: Type Aliases as the Source of Truth
    icon:
      src: /docs/assets/typescript-logo.svg
    details: Derive your parsers from your type aliases—not the other way around.
  - title: Type Inference
    icon:
      src: /docs/assets/typescript-logo.svg
    details: Do derive types from your parsers if you so choose
  - title: Lightweight
    icon: 🪶
    details: No dependencies, < 3 kB gzipped, and tree-shakeable
  - title: Fast
    icon: 🚀
    details: 4× faster than Zod
---

<script setup>
import WithinHero from "/docs/components/WithinHero.vue";
import FlickingCode from "/docs/components/FlickingCode.vue";

</script>

<WithinHero>
    <FlickingCode style="width: 100%"/>
</WithinHero>

<style lang="scss">
@use 'sass:meta';

@include meta.load-css('@egjs/vue3-flicking/dist/flicking.css');
</style>
