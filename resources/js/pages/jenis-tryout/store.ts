import { createCrudStore } from '@/stores/createCrudStore';
import { JenisTryout } from './types';

const useJenisTryoutStore = createCrudStore<JenisTryout | null>();

export default useJenisTryoutStore;
