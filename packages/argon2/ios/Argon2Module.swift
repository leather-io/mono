import Argon2Swift
import ExpoModulesCore

internal class WrongModeEnum: Exception {
  override var reason: String {
    "Wrong Mode Enum"
  }
}

public class Argon2Module: Module {
  public func definition() -> ModuleDefinition {

    Name("Argon2Module")
    // AsyncFunction("hash", hash)
    AsyncFunction(
      "hash",
      {
        (
          password: String,
          salt: String,
          modeInt: Int,
          iterations: Int,
          memory: Int,
          parallelism: Int,
          hashLength: Int,
          promise: Promise
        ) in

        let salt = Salt.init(bytes: Data(salt.utf8))
        guard let mode = Argon2Type(rawValue: modeInt) else {
          // TODO: promise reject
          promise.reject(WrongModeEnum())
          return
        }
        do {
          let result = try Argon2Swift.hashPasswordString(
            password: password,
            salt: salt,
            iterations: iterations,
            memory: memory,
            parallelism: parallelism,
            length: hashLength,
            type: mode
          )

          let encodedString = result.encodedString()
          promise.resolve(encodedString)
          return
        } catch {
          // TODO: promise reject
          promise.reject(error)
          return
        }
      })

    // AsyncFunction("verify", verify)
    AsyncFunction(
      "verify",
      {
        (
          encodedString: String,
          password: String,
          modeInt: Int,
          promise: Promise
        ) in

        guard let mode = Argon2Type(rawValue: modeInt) else {
          // TODO: promise reject
          promise.reject(WrongModeEnum())
          return
        }
        do {
          let verified = try Argon2Swift.verifyHashString(
            password: password,
            hash: encodedString,
            type: mode
          )
          promise.resolve(verified)
        } catch {
          // TODO: promise reject
          promise.reject(error)
          return
        }

      }

    )
  }
}

// private func hash(
//   password: String,
//   salt: String,
//   modeInt: Int,
//   iterations: Int,
//   memory: Int,
//   parallelism: Int,
//   hashLength: Int
// ) -> String {

//   let salt = Salt.init(bytes: Data(salt.utf8))
//   guard let mode = Argon2Type(rawValue: modeInt) else {
//     // TODO: promise reject
//     return
//   }
//   do {
//     let result = try Argon2Swift.hashPasswordString(
//       password: password,
//       salt: salt,
//       iterations: iterations,
//       memory: memory,
//       parallelism: parallelism,
//       length: hashLength,
//       type: mode
//     )

//     let encodedString = result.encodedString()
//     return encodedString

//   } catch {
//     // TODO: promise reject
//     return
//   }
// }

// private func verify(
//   encodedString: String,
//   password: String,
//   modeInt: Int
// ) {
//   guard let mode = Argon2Type(rawValue: modeInt) else {
//     // TODO: promise reject
//     return
//   }
//   do {
//     let verified = try Argon2Swift.verifyHashString(
//       password: password,
//       hash: encodedString,
//       type: mode
//     )
//     return verified
//   } catch {
//     // TODO: promise reject
//     return
//   }
// }

// public class CryptoModule: Module {
//   public func definition() -> ModuleDefinition {
//     Name("ExpoCrypto")

//     AsyncFunction("digestStringAsync", digestString)

//     Function("digestString", digestString)

//     AsyncFunction("getRandomBase64StringAsync", getRandomBase64String)

//     Function("getRandomBase64String", getRandomBase64String)

//     Function("getRandomValues", getRandomValues)

//     Function("digest", digest)

//     Function("randomUUID") {
//       UUID().uuidString.lowercased()
//     }
//   }
// }

// private func getRandomBase64String(length: Int) throws -> String {
//   var bytes = [UInt8](repeating: 0, count: length)
//   let status = SecRandomCopyBytes(kSecRandomDefault, length, &bytes)

//   guard status == errSecSuccess else {
//     throw FailedGeneratingRandomBytesException(status)
//   }
//   return Data(bytes).base64EncodedString()
// }

// private func digestString(algorithm: DigestAlgorithm, str: String, options: DigestOptions) throws -> String {
//   guard let data = str.data(using: .utf8) else {
//     throw LossyConversionException()
//   }

//   let length = Int(algorithm.digestLength)
//   var digest = [UInt8](repeating: 0, count: length)

//   data.withUnsafeBytes { bytes in
//     let _ = algorithm.digest(bytes.baseAddress, UInt32(data.count), &digest)
//   }

//   switch options.encoding {
//   case .hex:
//     return digest.reduce("") { $0 + String(format: "%02x", $1) }
//   case .base64:
//     return Data(digest).base64EncodedString()
//   }
// }

// private func getRandomValues(array: TypedArray) throws -> TypedArray {
//   let status = SecRandomCopyBytes(
//     kSecRandomDefault,
//     array.byteLength,
//     array.rawPointer
//   )

//   guard status == errSecSuccess else {
//     throw FailedGeneratingRandomBytesException(status)
//   }
//   return array
// }

// private func digest(algorithm: DigestAlgorithm, output: TypedArray, data: TypedArray) {
//   let length = Int(algorithm.digestLength)
//   let outputPtr = output.rawPointer.assumingMemoryBound(to: UInt8.self)
//   algorithm.digest(data.rawPointer, UInt32(data.byteLength), outputPtr)
// }

// private class LossyConversionException: Exception {
//   override var reason: String {
//     "Unable to convert given string without losing some information"
//   }
// }

// private class FailedGeneratingRandomBytesException: GenericException<OSStatus> {
//   override var reason: String {
//     "Generating random bytes has failed with OSStatus code: \(param)"
//   }
// }

// private func hash(
//   _ password: String,
//   salt: String,
//   modeInt: Int,
//   iterations: Int,
//   memory: Int,
//   parallelism: Int,
//   hashLength: Int,
//   resolve: RCTPromiseResolveBlock,
//   reject: RCTPromiseRejectBlock
// ) {
//   let salt = Salt.init(bytes: Data(salt.utf8))
//   guard let mode = Argon2Type(rawValue: modeInt) else {
//     // TODO: promise reject
//     return
//   }
//   do {
//     let result = try Argon2Swift.hashPasswordString(
//       password: password,
//       salt: salt,
//       iterations: iterations,
//       memory: memory,
//       parallelism: parallelism,
//       length: hashLength,
//       type: mode
//     )

//     let encodedString = result.encodedString()
//     resolve(encodedString)

//   } catch {
//     // TODO: promise reject
//     return
//   }
// }

// private func verify(
//   _ encodedString: String,
//   password: String,
//   modeInt: Int,
//   resolve: RCTPromiseResolveBlock,
//   reject: RCTPromiseRejectBlock
// ) {
//   guard let mode = Argon2Type(rawValue: modeInt) else {
//     // TODO: promise reject
//     return
//   }
//   do {
//     let verified = try Argon2Swift.verifyHashString(
//       password: password,
//       hash: encodedString,
//       type: mode
//     )
//     resolve(verified)
//   } catch {
//     // TODO: promise reject
//     return
//   }
// }
