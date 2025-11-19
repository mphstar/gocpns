import { createCrudStore } from '@/stores/createCrudStore';
import { KategoriRecord } from './types';

const useKategoriStore = createCrudStore<KategoriRecord | null>();

export default useKategoriStore;
