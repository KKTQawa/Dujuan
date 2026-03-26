import { create } from 'zustand';

interface ArchiveState {
  archiveList: Array<any>;
  setArchiveList: (list: Array<any>) => void;
  getArchiveItem: (id: number) => any;
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  archiveList: [],
  setArchiveList: (list) => set({ archiveList: list }),
  getArchiveItem: (id: number) => {
    return get().archiveList.find((item: any) => item.id === id);
  },
}));