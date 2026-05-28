import { defineStore } from 'pinia';
import { ref } from 'vue';
import { clientsApplication } from './clients.application';

export const useClientsStore = defineStore('clients', () => {
  const clients = ref([]);
  const loading = ref(false);

  async function loadClients() {
    loading.value = true;
    try {
      clients.value = await clientsApplication.getClients();
    } finally {
      loading.value = false;
    }
  }

  function clientById(id) {
    return clients.value.find((c) => c.id === id) || null;
  }

  function activeClients() {
    return clients.value.filter((c) => c.status === 'active');
  }

  return { clients, loading, loadClients, clientById, activeClients };
});
