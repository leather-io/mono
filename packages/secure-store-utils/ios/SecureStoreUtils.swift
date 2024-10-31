import ExpoModulesCore
import LocalAuthentication
import Security

/*
 Use some functionality of expo-secure-store@13.0.2 to support new function updateKeysSecuritySettingsAsync
 */

public class SecureStoreUtils: Module {
    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    public func definition() -> ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('SecureStoreUtils')` in JavaScript.
        Name("SecureStoreUtils")

        AsyncFunction("updateKeysSecuritySettingsAsync") {
            (keys: [String], options: SecureStoreOptions, promise: Promise) in
            let context = LAContext()

            context.interactionNotAllowed = false
            let policyForAuth = LAPolicy.deviceOwnerAuthentication

            context.evaluatePolicy(
                policyForAuth,
                localizedReason: options.authenticationPrompt ?? "Placeholder"
            ) { success, error in

                if let error = error as? NSError {
                    promise.reject(LocalAuthenticationException(error))
                    return
                }
                do {
                    try keys.forEach { key in
                        let item = try self.get(
                            with: key, options: options, context: context)
                        if let item {
                            try self.set(
                                value: item, with: key, options: options,
                                context: context)
                        } else {
                            // Setting -999 s.t. it throws a default message
                            promise.reject(KeyChainException(-999))
                            return
                        }
                    }
                    promise.resolve()
                } catch {
                    // Think of a better way to relay exception from self.set function
                    promise.reject(InvalidKeyException())
                }
            }
        }

    }

    private func get(
        with key: String, options: SecureStoreOptions, context: LAContext? = nil
    )
        throws
        -> String?
    {
        guard let key = validate(for: key) else {
            throw InvalidKeyException()
        }

        if let unauthenticatedItem = try searchKeyChain(
            with: key, options: options, requireAuthentication: false,
            context: context)
        {
            return String(data: unauthenticatedItem, encoding: .utf8)
        }

        if let authenticatedItem = try searchKeyChain(
            with: key, options: options, requireAuthentication: true,
            context: context)
        {
            return String(data: authenticatedItem, encoding: .utf8)
        }

        if let legacyItem = try searchKeyChain(
            with: key, options: options, context: context)
        {
            return String(data: legacyItem, encoding: .utf8)
        }

        return nil
    }

    private func set(
        value: String, with key: String, options: SecureStoreOptions,
        context: LAContext? = nil
    ) throws -> Bool {
        var setItemQuery = query(
            with: key, options: options,
            requireAuthentication: options.requireAuthentication)
        setItemQuery[kSecUseAuthenticationContext as String] = context
        let valueData = value.data(using: .utf8)
        setItemQuery[kSecValueData as String] = valueData

        let accessibility = attributeWith(options: options)

        if !options.requireAuthentication {
            setItemQuery[kSecAttrAccessible as String] = accessibility
        } else {
            guard
                Bundle.main.infoDictionary?["NSFaceIDUsageDescription"]
                    as? String != nil
            else {
                throw MissingPlistKeyException()
            }
            let accessOptions = SecAccessControlCreateWithFlags(
                kCFAllocatorDefault, accessibility,
                SecAccessControlCreateFlags.userPresence, nil)
            setItemQuery[kSecAttrAccessControl as String] = accessOptions
        }

        let status = SecItemAdd(setItemQuery as CFDictionary, nil)

        switch status {
        case errSecSuccess:
            // On success we want to remove the other key alias and legacy key (if they exist) to avoid conflicts during reads
            SecItemDelete(query(with: key, options: options) as CFDictionary)
            SecItemDelete(
                query(
                    with: key, options: options,
                    requireAuthentication: !options.requireAuthentication)
                    as CFDictionary)
            return true
        case errSecDuplicateItem:
            return try update(
                value: value, with: key, options: options, context: context)
        default:
            throw KeyChainException(status)
        }
    }

    private func update(
        value: String, with key: String, options: SecureStoreOptions,
        context: LAContext? = nil
    ) throws -> Bool {
        var query = query(
            with: key, options: options,
            requireAuthentication: options.requireAuthentication)
        query[kSecUseAuthenticationContext as String] = context
        let valueData = value.data(using: .utf8)
        let updateDictionary = [kSecValueData as String: valueData]

        if let authPrompt = options.authenticationPrompt {
            query[kSecUseOperationPrompt as String] = authPrompt
        }

        let status = SecItemUpdate(
            query as CFDictionary, updateDictionary as CFDictionary)

        if status == errSecSuccess {
            return true
        } else {
            throw KeyChainException(status)
        }
    }

    private func searchKeyChain(
        with key: String, options: SecureStoreOptions,
        requireAuthentication: Bool? = nil,
        context: LAContext? = nil
    ) throws -> Data? {
        var query = query(
            with: key, options: options,
            requireAuthentication: requireAuthentication)
        query[kSecUseAuthenticationContext as String] = context
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        query[kSecReturnData as String] = kCFBooleanTrue

        if let authPrompt = options.authenticationPrompt {
            query[kSecUseOperationPrompt as String] = authPrompt
        }

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)

        switch status {
        case errSecSuccess:
            guard let item = item as? Data else {
                return nil
            }
            return item
        case errSecItemNotFound:
            return nil
        default:
            throw KeyChainException(status)
        }
    }

    private func query(
        with key: String, options: SecureStoreOptions,
        requireAuthentication: Bool? = nil
    ) -> [String: Any] {
        var service = options.keychainService ?? "app"
        if let requireAuthentication {
            service.append(":\(requireAuthentication ? "auth" : "no-auth")")
        }

        let encodedKey = Data(key.utf8)

        return [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrGeneric as String: encodedKey,
            kSecAttrAccount as String: encodedKey,
        ]
    }

    private func attributeWith(options: SecureStoreOptions) -> CFString {
        switch options.keychainAccessible {
        case .afterFirstUnlock:
            return kSecAttrAccessibleAfterFirstUnlock
        case .afterFirstUnlockThisDeviceOnly:
            return kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        case .always:
            return kSecAttrAccessibleAlways
        case .whenPasscodeSetThisDeviceOnly:
            return kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly
        case .whenUnlocked:
            return kSecAttrAccessibleWhenUnlocked
        case .alwaysThisDeviceOnly:
            return kSecAttrAccessibleAlwaysThisDeviceOnly
        case .whenUnlockedThisDeviceOnly:
            return kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        default:
            return kSecAttrAccessibleWhenUnlocked
        }
    }

    private func validate(for key: String) -> String? {
        let trimmedKey = key.trimmingCharacters(in: .whitespaces)
        if trimmedKey.isEmpty {
            return nil
        }
        return key
    }
}
