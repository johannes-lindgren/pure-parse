---
layout: home
title: PureParse
description: Strongly typed validation library that decouples types from validation logic.

hero:
  name: PureParse
  text: Typesafe, lightweight parsers
  tagline: Strongly typed validation library that decouples types from validation logic.
  actions:
    - theme: brand
      text: Getting Started
      link: /guide/getting-started
    - theme: alt
      text: Why PureParse?
      link: /guide/why-pure-parse
    - theme: alt
      text: API Reference
      link: /api
features:
  - title: Lightweight
    icon:
      light: /feather-light.svg
      dark: /feather-dark.svg
    details: 0 dependencies, 5 kB gzipped, and fully tree-shakeable.
    link: /guide/why-pure-parse#lightweight
  - title: Easy to use
    icon:
      light: /block-light.svg
      dark: /block-dark.svg
    details: Compose and customize with ease.
    link: /guide/why-pure-parse#extensible-and-easy-to-use
  - title: Fast
    icon:
      light: /guage-light.svg
      dark: /guage-dark.svg
    details: Among the fastest validators. Memoize for even better performance.
    link: /guide/why-pure-parse#fast
  - title: Fail-safe
    icon:
      light: /shield-light.svg
      dark: /shield-dark.svg
    details: Recover from errors gracefully when parsing large documents.
    link: /guide/why-pure-parse#fail-safe
---

<script setup>
import WithinHero from "/components/WithinHero.vue";
import FlickingCode from "/components/FlickingCode.vue";

</script>

<WithinHero>
    <FlickingCode/>
</WithinHero>
