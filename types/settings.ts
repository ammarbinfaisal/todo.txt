export interface AppSettings {
  projectPrefix: string;
  contextPrefix: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  projectPrefix: "+",
  contextPrefix: "@",
};
