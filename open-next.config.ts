import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import d1TagCache from '@opennextjs/cloudflare/d1-tag-cache';
import cache from '@opennextjs/cloudflare/kv-cache';
import memoryQueue from '@opennextjs/cloudflare/memory-queue';

const config = defineCloudflareConfig({
  incrementalCache: cache,
  tagCache: d1TagCache,
  queue: memoryQueue,
});

export default config;
