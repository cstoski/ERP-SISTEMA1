import api from './api';

export type TemplateStatus = {
  filename: string;
  exists: boolean;
  updated_at: string | null;
};

export type TemplatesResponse = {
  path: string;
  files: Record<string, TemplateStatus>;
};

const templatesService = {
  listar: async (): Promise<TemplatesResponse> => {
    const res = await api.get('/api/templates/');
    return res.data;
  },
  upload: async (formData: FormData) => {
    const res = await api.post('/api/templates/', formData);
    return res.data;
  },
};

export default templatesService;
