package com.leather.mobilewallet

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.lambdapioneer.argon2kt.Argon2Kt
import com.lambdapioneer.argon2kt.Argon2KtResult
import com.lambdapioneer.argon2kt.Argon2Mode

class Argon2Module(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    // add to Argon2Module.kt
    override fun getName() = "Argon2Module"

    private inline fun <reified T : Enum<T>> toEnum(integer: Int): T? {
        return enumValues<T>().firstOrNull { it.ordinal == integer }
    }

    // TODO: we might want to have both hash and verify functions running on another thread, as we
    // don't want to block the UI thread.
    @ReactMethod
    fun verify(
        encodedString: String,
        password: String,
        modeInt: Int,
        promise: Promise,
    ) {
        val argon2Kt = Argon2Kt()

        // TODO: Handle wrong enum better
        val mode = toEnum<Argon2Mode>(modeInt) ?: return
        val passwordByteArray = password.toByteArray()

        promise.resolve(
            argon2Kt.verify(
                mode,
                encoded = encodedString,
                password = passwordByteArray,
            ),
        )
    }

    @ReactMethod
    fun hash(
        password: String,
        salt: String,
        modeInt: Int,
        tCostInIterations: Int,
        mCostInKibibyte: Int,
        parallelism: Int,
        hashLengthInBytes: Int,
        promise: Promise,
    ) {
        // initialize Argon2Kt and load the native library
        val argon2Kt = Argon2Kt()
        // TODO: Handle wrong enum better
        val mode = toEnum<Argon2Mode>(modeInt) ?: return
        // TODO: We might need to use direct-allocated ByteBuffers here to avoid storing secrets in
        // memory.
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
    }
}
