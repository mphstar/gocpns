import { createCrudStore } from '@/stores/createCrudStore';
import { MateriRecord } from './types';

const useMateriStore = createCrudStore<MateriRecord | null>();

export default useMateriStore;
