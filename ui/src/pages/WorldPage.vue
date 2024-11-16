<template>
  <q-page class="q-ma-md">
    <table class="island-table">
      <thead>
        <tr>
          <th></th>
          <th v-for="x in mapWidth" :key="x">{{ x }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="y in mapHeight" :key="y">
          <td>{{ y }}</td>
          <td v-for="x in mapWidth" :key="x">
            <!-- {{ getIsland(x, y)?.name }} -->
            <template v-for="(island, i) in [getIsland(x, y)]">
              <img
                :key="i"
                v-if="island?.image"
                :src="island?.image"
                :alt="island?.name"
              />
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </q-page>
</template>

<script setup lang="ts">
import { generateIslandImage } from 'src/services/world/generation';
import { ref } from 'vue';

interface IslandItem {
  name: string;
  x: number;
  y: number;
  owner: string;
  image: string;
  width: number;
  height: number;
}

const islandItems = ref<IslandItem[]>([]);

function addIsland(
  name: string,
  x: number,
  y: number,
  owner: string,
  width: number,
  height: number,
): void {
  islandItems.value.push({
    name,
    x,
    y,
    owner,
    image: generateIslandImage(width, height),
    width,
    height,
  });
}

addIsland('Island 1', 1, 2, 'Owner 1', 10, 18);
addIsland('Island 2', 3, 4, 'Owner 2', 4, 7);
// Add more island items as needed

const mapWidth = ref(Math.max(...islandItems.value.map((item) => item.x)));
const mapHeight = ref(Math.max(...islandItems.value.map((item) => item.y)));

const getIsland = (x: number, y: number): IslandItem | null => {
  const island = islandItems.value.find((item) => item.x === x && item.y === y);
  return island ? island : null;
};
</script>

<style lang="scss">
.island-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    width: calc(100% / var(--map-width));
    padding: 8px;
    text-align: center;
    border: 1px solid #ddd;
  }

  th {
    font-weight: bold;
  }

  th:first-child,
  td:first-child {
    font-weight: bold;
  }
}
</style>
