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
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api
features:
  - title: Easy to use
    icon:
      src: /assets/block.svg
    details: Compose and customize with ease
  - title: Lightweight
    icon:
      src: /assets/feather.svg
    details: 0 dependencies, tree-shakeable, and less than 3 kB gzipped
  - title: Fast
    icon:
      src: /assets/guage.svg
    details: Memoize and enjoy 4× faster than Zod
---

<script setup>
import WithinHero from "/components/WithinHero.vue";
import FlickingCode from "/components/FlickingCode.vue";

</script>

<WithinHero>
    <FlickingCode/>
</WithinHero>

<style lang="scss">
@use 'sass:meta';

@include meta.load-css('@egjs/vue3-flicking/dist/flicking.css');
</style>
