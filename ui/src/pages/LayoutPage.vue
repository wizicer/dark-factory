<template>
  <div class="q-ma-md">
    <!-- <p>{{ title }}</p> -->
    <div class="container">
      <canvas
        ref="myCanvas"
        :width="par?.mapWidth ?? 300"
        :height="par?.mapHeight ?? 200"
      ></canvas>
    </div>
    <template v-if="par">
      <br />
      <q-btn
        v-for="(button, index) in par.placements"
        :key="index"
        :color="index == par.sourceTile ? 'primary' : 'grey-9'"
        outline
        @click="par.sourceTile = index"
      >
        <img
          class="image-button"
          :style="{
            backgroundImage: `url(${button.image})`,
            width: `${button.tileWidth * par.baseSize}px`,
            height: `${button.tileHeight * par.baseSize}px`,
            backgroundPosition: `-${button.xOffset * (par.baseSize + 1)}px -${button.yOffset * (par.baseSize + 1)}px`,
          }"
        />
      </q-btn>
      <br />
      Production Rate: {{ productionRate }}
      <br />
      <q-btn label="Save" @click="save()" color="secondary"></q-btn>
      <q-btn label="Load" @click="load()" color="secondary"></q-btn>
      <q-btn label="Generate" @click="generate()" color="primary"></q-btn>
      <q-btn label="Prove" @click="prove()" color="secondary"></q-btn>
      <template v-for="(_layer, index) in layers" :key="index">
        <br />
        <q-input
          v-model="layers[index]"
          type="textarea"
          readonly
          autogrow
          style="font-family: monospace; min-width: 600px"
        />
      </template>
      <template v-if="proofString">
        <h6>Proof:</h6>
        <br />
        <q-input
          v-model="proofString"
          type="textarea"
          readonly
          autogrow
          style="font-family: monospace; min-width: 600px"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, useTemplateRef } from 'vue';
import { useQuasar } from 'quasar';
import { MapParameters } from 'src/services/layout/definitions';
import { mountCanvas } from 'src/services/layout/canvas';
import { redrawMap } from 'src/services/layout/drawMap';
import { generateWitnessRaw } from 'src/services/proof/witness';
import { getLayoutProof } from 'src/services/proof/gameProof';
import { useRoute } from 'vue-router';
import { getPath } from 'src/services/proof/path';

const myCanvas = useTemplateRef('myCanvas');

const index = ref(-1);
let par: Ref<MapParameters | null> = ref(null);

onMounted(() => {
  if (myCanvas.value) {
    let canvas: HTMLCanvasElement = myCanvas.value as HTMLCanvasElement;
    const route = useRoute();
    const rows = Number((route.query.rows as string) || '8');
    const cols = Number((route.query.cols as string) || '18');
    index.value = Number((route.query.index as string) || '-1');

    par.value = mountCanvas(canvas, rows, cols);
    setTimeout(() => {
      if (par.value) redrawMap(par.value);
    }, 200);
  }
});

const layers: Ref<string[]> = ref([]);
const productionRate = ref(0);

const $q = useQuasar();
function save() {
  if (!par.value) return;
  try {
    localStorage.setItem('mapTiles', JSON.stringify(par.value.tiles));
    $q.notify({
      type: 'positive',
      message: 'Map saved successfully!',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to save map: ' + error,
    });
  }
}

function load() {
  if (!par.value) return;
  const savedTiles = localStorage.getItem('mapTiles');
  if (savedTiles) {
    try {
      par.value.tiles = JSON.parse(savedTiles);
      redrawMap(par.value);
      $q.notify({
        type: 'positive',
        message: 'Map loaded successfully!',
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to load map: ' + error,
      });
    }
  } else {
    $q.notify({
      type: 'negative',
      message: 'No saved map found.',
    });
  }
}

const witnessValues: Ref<number[]> = ref([]);
const pathValues: Ref<number[]> = ref([]);
function generate() {
  if (!par.value) return;
  const { steps, rate, witness } = generateWitnessRaw(par.value);
  productionRate.value = rate;

  layers.value = Object.entries(steps).map(
    ([key, value]) => `${key}\n${value}`,
  );

  witnessValues.value = witness;

  pathValues.value = getPath(witnessValues.value, par.value.mapColumns);
}

const proof = ref({});
const proofString = ref('');
async function prove() {
  $q.loading.show({
    message: 'Getting proof...',
  });

  try {
    proof.value = 'todo';
    proof.value = await getLayoutProof(
      witnessValues.value.map((num) => BigInt(num)),
      pathValues.value.map((num) => BigInt(num)),
    );
    proofString.value = JSON.stringify(proof.value, null, 4);
    $q.notify({
      type: 'positive',
      message: 'Proof generated successfully!',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to generate proof: ' + error,
    });
  } finally {
    $q.loading.hide();
  }
}
</script>

<style lang="scss" scoped></style>
