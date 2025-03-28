import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import cache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';
import d1TagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-tag-cache';

const config = defineCloudflareConfig({
  incrementalCache: cache,
  tagCache: d1TagCache,
  queue: memoryQueue,
});

export default config;
