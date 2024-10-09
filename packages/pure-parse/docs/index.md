---
layout: home

hero:
  name: PureParse
  text: Typesafe, lightweight parsers
  tagline: Decouple type aliases from validation logic with explicit type declarations
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
    details: 4 times the speed of Zod. Memoize for even faster validation.
    link: /guide/overview#fast
  - title: Fail-safe
    icon:
      src: /shield.svg
    details: Recover from errors gracefully when parsing large documents. Tested, failsafe, and secure.
    link: /guide/overview#fail
---

<script setup>
import WithinHero from "/components/WithinHero.vue";
import FlickingCode from "/components/FlickingCode.vue";

</script>

<WithinHero>
    <FlickingCode/>
</WithinHero>
