import Argon2Swift

@objc(Argon2Module)
class Argon2Module: NSObject {

  @objc
  func hash(
    _ password: String,
    salt: String,
    modeInt: Int,
    iterations: Int,
    memory: Int,
    parallelism: Int,
    hashLength: Int,
    resolve: RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    let salt = Salt.init(bytes: Data(salt.utf8))
    guard let mode = Argon2Type(rawValue: modeInt) else {
      // TODO: promise reject
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
      resolve(encodedString)

    } catch {
      // TODO: promise reject
      return
    }
  }

  @objc
  func verify(
    _ encodedString: String,
    password: String,
    modeInt: Int,
    resolve: RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    guard let mode = Argon2Type(rawValue: modeInt) else {
      // TODO: promise reject
      return
    }
    do {
      let verified = try Argon2Swift.verifyHashString(
        password: password,
        hash: encodedString,
        type: mode
      )
      resolve(verified)
    } catch {
      // TODO: promise reject
      return
    }
  }

}
