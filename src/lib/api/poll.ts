import axios from '@/lib/utils/axios.customize';
import type { IBackendRes, IChatMessage, ICreatePollPayload, IPoll } from '@/types/global';

export const getPollByCodeAPI = (code: string): Promise<IBackendRes<IPoll>> => {
  return axios.get(`/polls/code/${code}`);
};

export const createPollAPI = (
  data: ICreatePollPayload
): Promise<IBackendRes<IPoll>> => {
  return axios.post('/polls', data);
};

export const getMyPollsAPI = (): Promise<IBackendRes<IPoll[]>> => {
  return axios.get('/my-polls');
};

export const votePollAPI = (
  id: string,
  selectedOptions: string[]
): Promise<IBackendRes<IPoll>> => {
  return axios.post(`/polls/${id}/vote`, { selectedOptions });
};
export const closePollAPI = (id: string): Promise<IBackendRes<IPoll>> => {
  return axios.patch(`/polls/${id}/close`);
};

export const deletePollAPI = (id: string): Promise<IBackendRes<null>> => {
  return axios.delete(`/polls/${id}`);
};

export const updatePollAPI = (id: string, data: Partial<{ chatEnabled: boolean }>): Promise<IBackendRes<IPoll>> => {
  return axios.patch(`/polls/${id}`, data);
};

export const getChatHistoryAPI = (pollCode: string): Promise<IBackendRes<IChatMessage[]>> => {
  return axios.get(`/polls/chat/${pollCode}`);
};