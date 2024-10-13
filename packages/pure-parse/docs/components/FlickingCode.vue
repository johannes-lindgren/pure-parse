<script setup lang="ts">
import CodeBlock from '/components/CodeBlock.vue'

import { AutoPlay } from '@egjs/flicking-plugins'
import Flicking from '@egjs/vue3-flicking'

const plugins = [
  new AutoPlay({
    duration: 2500,
    animationDuration: 1500,
    direction: 'NEXT',
    stopOnHover: true,
  }),
]

const codeDeclare = `
type User = {
  id: number
  name: string
}

const parseUser = object<User>({
  id: parseNumber,
  name: parseString,
})
`

const codeInfer = `
const parseUser = object({
  id: parseNumber,
  name: parseString,
})

type User = Infer<typeof parseUser>
`
</script>

<template>
  <Flicking
    :options="{ horizontal: false, circular: true }"
    :plugins="plugins"
    class="flicking-code"
  >
    <div :key="0" class="flicking-code__panel">
      <CodeBlock :code="codeDeclare">
        <template #caption>Declare the type:</template>
      </CodeBlock>
    </div>
    <div :key="1" class="flicking-code__panel">
      <CodeBlock :code="codeInfer">
        <template #caption>...or infer the type:</template>
      </CodeBlock>
    </div>
  </Flicking>
</template>

<style scoped lang="scss">
@use 'sass:meta';

@include meta.load-css('@egjs/vue3-flicking/dist/flicking.css');

$panel-height: 300px;

.flicking-code {
  height: $panel-height;
}

.flicking-code__panel {
  height: $panel-height;
}
</style>
