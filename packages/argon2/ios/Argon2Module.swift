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
          promise.reject(error)
          return
        }
      })

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
          promise.reject(error)
          return
        }

      }
    )
  }
}
