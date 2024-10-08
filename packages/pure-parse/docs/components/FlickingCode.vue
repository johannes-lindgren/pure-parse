<script setup lang="ts">
import CodeBlock from '/docs/components/CodeBlock.vue'

import { AutoPlay } from '@egjs/flicking-plugins'
import Flicking from '@egjs/vue3-flicking'

const plugins = [
  new AutoPlay({
    duration: 5000,
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

const isUser = object<User>({
  id: isNumber,
  name: isString,
})
`

const codeInfer = `
const isUser = object({
  id: isNumber,
  name: isString,
})

type User = Infer<typeof isUser>
`
</script>

<template>
  <Flicking
    :options="{ horizontal: false, circular: true }"
    :plugins="plugins"
    style="height: 400px"
  >
    <div :key="0" class="flicking-code__panel">
      <CodeBlock :code="codeDeclare">
        <template #caption>Declare the type</template>
      </CodeBlock>
    </div>
    <div :key="1" class="flicking-code__panel">
      <CodeBlock :code="codeInfer">
        <template #caption>Infer the type</template>
      </CodeBlock>
    </div>
  </Flicking>
</template>

<style scoped lang="scss">
@use 'sass:meta';

@include meta.load-css('@egjs/vue3-flicking/dist/flicking.css');
.flicking-code {
  height: 400px;
}

.flicking-code__panel {
  height: 400px;
}
</style>
