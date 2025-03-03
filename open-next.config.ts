import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import cache from '@opennextjs/cloudflare/kv-cache';
import memoryQueue from '@opennextjs/cloudflare/memory-queue';

const config = defineCloudflareConfig({
  incrementalCache: cache,
  queue: memoryQueue,
});

export default config;
