const { withEntitlementsPlist } = require("@expo/config-plugins");

module.exports = function withWatchBridge(config) {
  return withEntitlementsPlist(config, (cfg) => {
    const groups = cfg.modResults["com.apple.security.application-groups"] ?? [];
    if (!groups.includes("group.io.streamvault")) {
      cfg.modResults["com.apple.security.application-groups"] = [
        ...groups,
        "group.io.streamvault",
      ];
    }
    return cfg;
  });
};
