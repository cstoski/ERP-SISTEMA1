import api from './api';

export interface SystemInfo {
  environment: string;
  database_type: string;
  database_url: string;
  is_production: boolean;
}

export interface SwitchEnvironmentResponse {
  success: boolean;
  message: string;
  new_environment: string;
  active_database: string;
  requires_restart: boolean;
  warning: string;
}

class SystemService {
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await api.get<SystemInfo>('/api/system/info');
    return response.data;
  }

  async switchEnvironment(environment: 'development' | 'production'): Promise<SwitchEnvironmentResponse> {
    const response = await api.post<SwitchEnvironmentResponse>('/api/system/switch-environment', {
      environment
    });
    return response.data;
  }
}

export default new SystemService();
