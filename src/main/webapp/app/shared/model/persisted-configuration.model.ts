export interface IPersistedConfiguration {
  id?: number;
  key?: string;
  value?: string;
  userId?: number;
}

export const defaultValue: Readonly<IPersistedConfiguration> = {};
