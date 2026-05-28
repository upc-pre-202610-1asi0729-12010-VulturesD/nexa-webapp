import { clientsApiService } from '../infrastructure/clients-api';
import { ClientAssembler } from '../infrastructure/client.assembler';

const mapClientResource = (client) => ClientAssembler.toResource(ClientAssembler.toEntity(client));

export const clientsApplication = {
  getClients() {
    return clientsApiService.getClients().then(clients => clients.map(mapClientResource));
  },

  getClientById(id) {
    return clientsApiService.getClientById(id).then(mapClientResource);
  },

  getActiveClients() {
    return this.getClients().then(clients => clients.filter(c => c.status === 'active'));
  },
};
