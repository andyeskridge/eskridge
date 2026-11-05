import handler, {
  createScheduledHandler,
  PluginBridge,
} from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

const maintenance = createScheduledHandler();
export default {
  ...handler,
  async scheduled(controller, bindings, context) {
    if (bindings.SITE_READ_ONLY === "1") return;
    await maintenance(controller, bindings, context);
  },
} satisfies ExportedHandler<Record<string, unknown>>;
