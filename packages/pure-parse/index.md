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
      link: /docs/guide/getting-started
    - theme: alt
      text: API Reference
      link: /api
features:
  - title: Easy to use
    icon:
      src: /docs/assets/block.svg
    details: Compose and customize with ease
  - title: Lightweight
    icon:
      src: /docs/assets/feather.svg
    details: 0 dependencies, tree-shakeable, and less than 3 kB gzipped
  - title: Fast
    icon:
      src: /docs/assets/guage.svg
    details: Memoize and enjoy 4× faster than Zod
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
