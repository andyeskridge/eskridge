import { definePlugin } from "emdash";

// An exclusive moderator overrides EmDash's first-time/registered-user defaults.
// Every new comment (including owner replies) requires an explicit approval.
export function createPlugin() {
  return definePlugin({
    id: "eskridge-comment-policy",
    version: "1.0.0",
    capabilities: ["users:read"],
    hooks: {
      "comment:moderate": {
        exclusive: true,
        handler: () => ({ status: "pending", reason: "Held for owner review" }),
      },
    },
  });
}
