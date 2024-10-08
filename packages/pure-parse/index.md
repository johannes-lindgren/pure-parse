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
import CodeBlock from "/docs/components/CodeBlock.vue";

const code = `
type User = {
  id: number
  name: string
}

const isUser = object<User>({
  id: isNumber,
  name: isString,
})
`

</script>

<ClientOnly>
    <Teleport to=".VPHero > .container">
        <CodeBlock class="code-block-container" :code="code">
            <template #caption>Declare the type</template>
        </CodeBlock>
    </Teleport>
</ClientOnly>

Let your types be the source of truth:

Or—if you prefer—infer types from your parsers:

```ts
const isUser = object({
  id: isNumber,
  name: isString,
})
type User = Infer<typeof isUser>
```

<style lang="scss">

.code-block-container {
  order: 2;
}

.VPHero > .container > .main {
    width: unset;
    flex-shrink: unset;
}

.VPHero > .container {
    gap: 32px;
}

@media (min-width: 960px) {
    .VPHero > .container  {
        gap: 64px;
    }
}
</style>
