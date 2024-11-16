<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="!$q.screen.lt.md"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>Dark Factory</q-toolbar-title>
        <div>
          <q-btn flat dense round icon="email" />
          <q-btn flat dense round icon="settings" />
        </div>
        <div>
          <ConnectWalletButton
            :address="address"
            :txnCount="0"
            :dark="false"
            @click="connect"
          >
            <!-- Override the default text on the "Connect Wallet" button -->
            Connect Wallet!

            <template #pending>
              <!-- Override the blue pending transaction div -->
            </template>

            <template #spinner>
              <!-- Use your own Spinner (svg, css, image, etc.) -->
            </template>

            <template #identicon>
              <!-- Use your own identicon library. Jazzicon is the default -->
            </template>

            <template #connectWalletButton>
              <!-- Use your own button for the "Connect Wallet" state when no address is provided -->
            </template>

            <template #addressButton>
              <!-- Use your own button to display the address when address is provided. Does not remove the pending transaction div -->
            </template>
          </ConnectWalletButton>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Navigation</q-item-label>

        <q-item
          v-for="link in linksList"
          :key="link.title"
          clickable
          v-ripple
          :to="link.link"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.title }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <Suspense>
        <router-view />
      </Suspense>
    </q-page-container>

    <!-- Bottom Navigation Bar -->
    <q-footer class="q-pa-sm bg-grey-3" v-if="$q.screen.lt.md">
      <q-tabs v-model="tab" dense class="bg-grey-3 text-grey-7" align="justify">
        <q-route-tab
          v-for="link in linksList"
          :key="link.title"
          :to="link.link"
          :icon="link.icon"
          :label="link.title"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { EssentialLinkProps } from 'components/EssentialLink.vue';
import { ConnectWalletButton, useMetaMaskWallet } from 'vue-connect-wallet';

import { useMeta } from 'quasar';

useMeta({
  // JS tags
  script: {
    snarkjs: {
      // type: 'application/javascript',
      src: '/snarkjs.min.js',
    },
  },
});

const tab = ref('home');

defineOptions({
  name: 'MainLayout',
});

const linksList: EssentialLinkProps[] = [
  {
    title: 'World',
    icon: 'travel_explore',
    link: '/world',
  },
  {
    title: 'Layout',
    icon: 'app_registration',
    link: '/layout',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const wallet = useMetaMaskWallet();
// console.log(wallet);

const address = ref('');

wallet.onAccountsChanged((accounts: string[]) => {
  console.log('account changed to: ', accounts[0]);
});
wallet.onChainChanged((chainId: number) => {
  console.log('chain changed to:', chainId);
});

const connect = async () => {
  console.log('connect');
  const accounts = await wallet.connect();
  if (typeof accounts === 'string') {
    console.log('An error occurred' + accounts);
  }
  address.value = accounts[0];
};

// const switchAccount = async () => {
//   await wallet.switchAccounts();
//   connect();
// };

const isConnected = async () => {
  const accounts = await wallet.getAccounts();
  if (typeof accounts === 'string') return false;
  return accounts.length > 0;
};

isConnected().then((value) => {
  if (value) connect();
});
</script>
