import { useEffect, useState } from 'react';
import { getConfig, subscribeConfig, UserConfig } from '@/config/userConfig';

export const useUserConfig = (): UserConfig => {
  const [config, setConfig] = useState<UserConfig>(() => getConfig());
  useEffect(() => subscribeConfig(() => setConfig({ ...getConfig() })), []);
  return config;
};
