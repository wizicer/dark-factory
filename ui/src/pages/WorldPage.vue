<template>
  <q-page class="q-ma-md">
    Explore the world onchain via
    <a
      :href="'https://scroll-sepolia.blockscout.com/address/' + contract"
      target="_blank"
    >
      Blockscout
    </a>
    <table class="island-table" v-if="mapWidth && mapHeight">
      <thead>
        <tr>
          <th></th>
          <th v-for="x in mapWidth" :key="x">{{ x }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="y in mapHeight" :key="y">
          <td>{{ y }}</td>
          <template v-for="x in mapWidth" :key="x">
            <template v-for="(island, i) in [getIsland(x - 1, y - 1)]" :key="i">
              <td
                :class="{
                  'selected-island':
                    selectedIsland == (y - 1) * mapWidth + x - 1,
                  own: island?.owner == account,
                }"
                @click="selectedIsland = (y - 1) * mapWidth + x - 1"
              >
                <!-- {{ getIsland(x, y)?.name }} -->
                <q-tooltip v-if="island?.image">
                  {{
                    island?.name +
                    '[' +
                    island?.level +
                    ']' +
                    '\n' +
                    island?.tip
                  }}
                </q-tooltip>
                <img
                  :key="i"
                  v-if="island?.image"
                  :src="island?.image"
                  :alt="island?.name"
                />
              </td>
            </template>
          </template>
        </tr>
      </tbody>
    </table>
    <div class="q-ma-md"></div>
    <q-btn
      v-if="
        selectedIsland && getIslandByIndex(selectedIsland)?.owner == account
      "
      label="Edit"
      color="info"
      @click="edit(selectedIsland)"
    />
    <q-btn
      v-else-if="selectedIsland && getIslandByIndex(selectedIsland)?.level == 0"
      label="Claim"
      color="positive"
      @click="claim(selectedIsland)"
    />
    <q-btn
      v-else-if="selectedIsland"
      label="Attack"
      color="negative"
      @click="attack(selectedIsland)"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ethers, JsonRpcSigner } from 'ethers';
import { GameAbi__factory } from 'src/contracts';
import { generateIslandImage } from 'src/services/world/generation';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

interface IslandItem {
  name: string;
  x: number;
  y: number;
  owner: string;
  image: string;
  width: number;
  height: number;
  level: number;
  tip: string;
}

const islandItems = ref<IslandItem[]>([]);
const selectedIsland = ref<number | null>(null);

function addIsland(
  name: string,
  x: number,
  y: number,
  owner: string,
  width: number,
  height: number,
  level: number,
  tip: string,
): void {
  islandItems.value.push({
    name,
    x,
    y,
    owner,
    image: generateIslandImage(width, height),
    width,
    height,
    level,
    tip,
  });
}

const mapWidth = ref(0);
const mapHeight = ref(0);

const getIsland = (x: number, y: number): IslandItem | null => {
  const island = islandItems.value.find((item) => item.x === x && item.y === y);
  return island ? island : null;
};

function getIslandByIndex(index: number): IslandItem | null {
  const x = index % mapWidth.value;
  const y = Math.floor(index / mapWidth.value);
  const island = islandItems.value.find((item) => item.x === x && item.y === y);
  return island ? island : null;
}

const account = ref('');

let signer: JsonRpcSigner | null = null;

let provider;
let chainId;

if (window.ethereum == null) {
  // // If MetaMask is not installed, we use the default provider,
  // // which is backed by a variety of third-party services (such
  // // as INFURA). They do not have private keys installed so are
  // // only have read-only access
  // console.log('MetaMask not installed; using read-only defaults');
  // // provider = ethers.getDefaultProvider();
  // provider = (ethers as any).getDefaultProvider();
  console.log('metamask not found');
} else {
  // Connect to the MetaMask EIP-1193 object. This is a standard
  // protocol that allows Ethers access to make all read-only
  // requests through MetaMask.
  provider = new ethers.BrowserProvider(window.ethereum, undefined, {
    cacheTimeout: -1,
  });
  // provider = new ethers.BrowserProvider(window.ethereum, 31337);
  chainId = (await provider.getNetwork()).chainId;
  // const RPC_HOST = 'https://moonbase-alpha.public.blastapi.io/';
  // provider = new ethers.JsonRpcProvider(RPC_HOST);
  // provider = new Web3Provider(window.ethereum);

  // It also provides an opportunity to request access to write
  // operations, which will be performed by the private key
  // that MetaMask manages for the user.
  signer = await provider.getSigner();
  // console.log('get signer', provider, signer);

  // let accounts = await provider.send("eth_requestAccounts", []);
  // account.value = accounts[0];
  account.value = await signer.getAddress();
}

const contract =
  chainId == 31337n
    ? (process.env.GAME_CONTRACT ?? '')
    : chainId == 544351n // Scroll Sepolia
      ? (process.env.GAME_CONTRACT ?? '')
      : (process.env.GAME_CONTRACT ?? '');

const g = GameAbi__factory.connect(contract, signer);

// const gameList: Ref<GameState[]> = ref([]);
const isListRefreshing = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

onMounted(async () => {
  await refreshTable();
});

interface Cell {
  owner: string;
  level: number;
  rate: number;
  capacity: number;
  energy: number;
  lastUpdate: number;
  seed: bigint;
}

function convertMapData(
  mapData: [string, bigint, bigint, bigint, bigint, bigint, bigint][],
): Cell[] {
  return mapData.map((cell) => ({
    owner: cell[0],
    level: Number(cell[1]),
    rate: Number(cell[2]),
    capacity: Number(cell[3]),
    energy: Number(cell[4]),
    lastUpdate: Number(cell[5]),
    seed: cell[6],
  }));
}

async function refreshTable() {
  try {
    isListRefreshing.value = true;
    const mapData = await g.getMapData();
    mapWidth.value = Number(await g.mapWidth());
    mapHeight.value = Number(await g.mapHeight());
    const mw = mapWidth.value;
    const convertedMapData = convertMapData(mapData);
    islandItems.value = [];
    convertedMapData.forEach((cell, index) => {
      const x = index % mw;
      const y = Math.floor(index / mw);
      const [w, h] = getSizeByLevel(cell.level);
      addIsland(
        `Island ${index + 1}`,
        x,
        y,
        cell.owner,
        w,
        h,
        cell.level,
        `${cell.energy}/${cell.capacity}(+${cell.rate})`,
      );
    });
    console.log(islandItems.value, mw);
  } finally {
    isListRefreshing.value = false;
  }
}

function getSizeByLevel(level: number) {
  if (level == 0) {
    return [18, 8];
  } else if (level == 1) {
    return [20, 8];
  } else if (level == 2) {
    return [20, 12];
  } else if (level == 3) {
    return [20, 18];
  } else if (level == 4) {
    return [24, 24];
  } else {
    throw new Error('Invalid level');
  }
}

import { useQuasar } from 'quasar';

const $q = useQuasar();

async function claim(index: number) {
  try {
    await g.claimCell(index);
    // Notify user of success
    $q.notify({
      type: 'positive',
      message: 'Claim successful!',
      position: 'top',
    });
    // Refresh the table to reflect the new state
    await refreshTable();
  } catch (error) {
    // Notify user of error
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = `Claim failed: ${error.message}`;
    }
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
    });
  }
}

function attack(index: number) {
  console.log('claim', index);
}

function edit(index: number) {
  console.log('claim', index);
  const island = getIslandByIndex(index);
  if (island) {
    const rows = island.height;
    const cols = island.width;
    router.push({ path: '/layout', query: { rows, cols, index } });
  }
}
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

  .selected-island {
    background-color: #f0f0f0;
  }

  .own {
    background-color: #fee0e0;
  }
}
</style>
