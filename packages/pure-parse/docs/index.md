---
layout: home

hero:
  name: PureParse
  text: Typesafe, lightweight parsers
  tagline: Lightweight validation library that decouples type aliases from validation logic
  actions:
    - theme: brand
      text: Quick Start
      link: /guide/getting-started
    - theme: alt
      text: Overview
      link: /guide/overview
    - theme: alt
      text: API Reference
      link: /api
features:
  - title: Lightweight
    icon:
      src: /feather.svg
    details: 0 dependencies, tree-shakeable, and less than 3 kB gzipped.
    link: /guide/overview#lightweight
  - title: Easy to use
    icon:
      src: /block.svg
    details: Compose and customize with ease.
    link: /guide/overview#extensible-and-easy-to-use
  - title: Fast
    icon:
      src: /guage.svg
    details: Among the fastest validators. Memoize for even better performance.
    link: /guide/overview#fast
  - title: Fail-safe
    icon:
      src: /shield.svg
    details: Recover from errors gracefully when parsing large documents.
    link: /guide/overview#fail-safe
---

<script setup>
import WithinHero from "/components/WithinHero.vue";
import FlickingCode from "/components/FlickingCode.vue";

</script>

<WithinHero>
    <FlickingCode/>
</WithinHero>
