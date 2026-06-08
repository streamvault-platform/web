import ExpoModulesCore
import Security

// Writes server config to the shared App Group so the watchOS app can read it on launch.
// Requires "group.io.streamvault" to be registered in Apple Developer Portal and present
// in both this app's and the watch app's App Groups entitlement.
public class WatchBridgeModule: Module {
    private let groupId = "group.io.streamvault"
    private let keychainService = "io.streamvault.watch"

    public func definition() -> ModuleDefinition {
        Name("WatchBridge")

        AsyncFunction("sendConfig") { (config: [String: String]) in
            let defaults = UserDefaults(suiteName: self.groupId)
            defaults?.set(config["serverUrl"], forKey: "serverUrl")
            defaults?.synchronize()
            if let accessToken = config["accessToken"] {
                self.writeKeychain(account: "accessToken", value: accessToken)
            }
            if let refreshToken = config["refreshToken"] {
                self.writeKeychain(account: "refreshToken", value: refreshToken)
            }
        }
    }

    private func writeKeychain(account: String, value: String) {
        guard let data = value.data(using: .utf8) else { return }
        let base: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: keychainService,
            kSecAttrAccount: account,
            kSecAttrAccessGroup: groupId,
        ]
        SecItemDelete(base as CFDictionary)
        var add = base
        add[kSecValueData] = data
        add[kSecAttrAccessible] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(add as CFDictionary, nil)
    }
}
