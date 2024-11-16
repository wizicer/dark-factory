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
      <router-view />
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
</script>
