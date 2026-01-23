import api from './api';

export const fileService = {
    uploadFile: async (file, type) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await api.post('/files/upload', formData);

        return response.data;
    },

    getDownloadUrl: (filePath) => {
        if (!filePath) return null;
        return `${api.defaults.baseURL}/files/download/${filePath}`;
    },
};
