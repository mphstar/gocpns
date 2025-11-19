import { createCrudStore } from '@/stores/createCrudStore';
import { BankSoalRecord } from './types';

const useBankSoalStore = createCrudStore<BankSoalRecord | null>();

export default useBankSoalStore;
