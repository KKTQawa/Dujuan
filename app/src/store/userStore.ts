import { create } from 'zustand';

interface UserState {
  hasLogin: boolean;
  user: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  setUserInfo: (userInfo: {user?: string; token?: string; nickname?: string; avatarUrl?: string }) => void;
}

export const useUserStore = create<UserState>((set) => ({
  hasLogin: false,
  user: null,
  nickname: null,
  avatarUrl: null,
  token: null,
  login: () => set({ hasLogin: true }),
  logout: () =>
    set({
      hasLogin: false,
      user: null,
      token: null,
    }),
  setUserInfo: (userInfo) =>
    set((state) => ({
      user: userInfo.user ?? state.user,
      token: userInfo.token ?? state.token,
    })),
}));