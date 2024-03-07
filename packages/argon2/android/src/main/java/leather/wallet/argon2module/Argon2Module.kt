package leather.wallet.argon2module

import com.lambdapioneer.argon2kt.Argon2Kt
import com.lambdapioneer.argon2kt.Argon2KtResult
import com.lambdapioneer.argon2kt.Argon2Mode
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private class WrongModeEnum : CodedException("Wrong Mode Enum")

class Argon2Module : Module() {
    private inline fun <reified T : Enum<T>> toEnum(integer: Int): T? {
        return enumValues<T>().firstOrNull { it.ordinal == integer }
    }

    override fun definition() =
        ModuleDefinition {
            AsyncFunction("verify") {
                    encodedString: String,
                    password: String,
                    modeInt: Int,
                    promise: Promise,
                ->

                try {
                    val argon2Kt = Argon2Kt()

                    // TODO: Handle wrong enum better
                    val mode =
                        toEnum<Argon2Mode>(modeInt) ?: run {
                            promise.reject(WrongModeEnum())
                            return@AsyncFunction
                        }
                    val passwordByteArray = password.toByteArray()

                    promise.resolve(
                        argon2Kt.verify(
                            mode,
                            encoded = encodedString,
                            password = passwordByteArray,
                        ),
                    )
                } catch (e: CodedException) {
                    promise.reject(e)
                }
            }

            AsyncFunction("hash") {
                    password: String,
                    salt: String,
                    modeInt: Int,
                    tCostInIterations: Int,
                    mCostInKibibyte: Int,
                    parallelism: Int,
                    hashLengthInBytes: Int,
                    promise: Promise,
                ->

                try {
                    // initialize Argon2Kt and load the native library
                    val argon2Kt = Argon2Kt()
                    // TODO: Handle wrong enum better
                    val mode =
                        toEnum<Argon2Mode>(modeInt) ?: run {
                            promise.reject(WrongModeEnum())
                            return@AsyncFunction
                        }
                    // TODO: We might need to use direct-allocated ByteBuffers here to avoid storing secrets
                    // in memory.
                    // With direct-allocated ByteBuffers we can overwrite the location where we stored the
                    // secrets.
                    // Ref: https://github.com/lambdapioneer/argon2kt/tree/main#faq-
                    val passwordByteArray = password.toByteArray()
                    val saltByteArray = salt.toByteArray()
                    // hash a password
                    val hashResult: Argon2KtResult =
                        argon2Kt.hash(
                            mode,
                            password = passwordByteArray,
                            salt = saltByteArray,
                            tCostInIterations,
                            mCostInKibibyte,
                            parallelism,
                            hashLengthInBytes,
                        )

                    val encodedString = hashResult.encodedOutputAsString()

                    promise.resolve(encodedString)
                } catch (e: CodedException) {
                    promise.reject(e)
                }
            }
        }
}
