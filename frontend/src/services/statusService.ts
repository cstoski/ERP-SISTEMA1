import api from './api';

export interface StatusInfo {
  db_status: 'ok' | 'erro';
  hostname: string;
  ip: string;
  server_count: number;
}

class StatusService {
  async getStatusInfo(): Promise<StatusInfo> {
    const response = await api.get<StatusInfo>('/api/status/info');
    return response.data;
  }
}

export default new StatusService();
