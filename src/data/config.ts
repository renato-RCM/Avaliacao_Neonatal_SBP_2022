import rawConfig from './capurro_config.json';
import type { CapurroConfig } from '@/types/domain';

export const capurroConfig = rawConfig as unknown as CapurroConfig;
