import { createStore } from '@/core/store';

interface LayoutState {
  isDrawerOpen: boolean;
}

const initialState: LayoutState = {
  isDrawerOpen: false,
};

export const useLayoutStore = createStore<LayoutState>(initialState);

export const layoutActions = {
  toggleDrawer: () => useLayoutStore.setState((state: LayoutState) => ({ isDrawerOpen: !state.isDrawerOpen })),
  openDrawer: () => useLayoutStore.setState({ isDrawerOpen: true }),
  closeDrawer: () => useLayoutStore.setState({ isDrawerOpen: false }),
};
