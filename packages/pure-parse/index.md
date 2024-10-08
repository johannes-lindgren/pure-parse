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
  - title: Type safety
    icon:
      src: /docs/assets/typescript-logo.svg
    details: Do derive types from your parsers if you so choose
  - title: Lightweight
    icon: 🪶
    details: No dependencies, tree-shakeable, and less than 3 kB gzipped
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
