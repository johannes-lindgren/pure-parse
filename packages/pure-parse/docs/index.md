---
layout: home

hero:
  name: PureParse
  text: Typesafe, lightweight parsers
  tagline: Decouple type aliases from validation logic with explicit type declarations
  actions:
    - theme: brand
      text: Getting Started
      link: /guide/getting-started
    - theme: alt
      text: Overview
      link: /guide/overview
    - theme: alt
      text: API Reference
      link: /api
features:
  - title: Easy to use
    icon:
      src: /block.svg
    details: Compose and customize with ease
  - title: Lightweight
    icon:
      src: /feather.svg
    details: 0 dependencies, tree-shakeable, and less than 3 kB gzipped
  - title: Fast
    icon:
      src: /guage.svg
    details: Memoize and enjoy 4× faster than Zod
---

<script setup>
import WithinHero from "/components/WithinHero.vue";
import FlickingCode from "/components/FlickingCode.vue";

</script>

<WithinHero>
    <FlickingCode/>
</WithinHero>
