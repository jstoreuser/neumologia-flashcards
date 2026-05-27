import { createStore } from 'zustand/vanilla';

interface LayoutState {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useLayoutStore = createStore<LayoutState>((set) => ({
  isDrawerOpen: false,
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
}));

export const layoutActions = {
  toggleDrawer: () => useLayoutStore.getState().toggleDrawer(),
  openDrawer: () => useLayoutStore.getState().openDrawer(),
  closeDrawer: () => useLayoutStore.getState().closeDrawer(),
};
