#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (Argon2Module, NSObject)

RCT_EXTERN_METHOD(hash
                  : (NSString *)password salt
                  : (NSString *)salt modeInt
                  : (nonnull NSInteger *)modeInt iterations
                  : (nonnull NSInteger *)iterations memory
                  : (nonnull NSInteger *)memory parallelism
                  : (nonnull NSInteger *)parallelism hashLength
                  : (nonnull NSInteger *)hashLength resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(verify
                  : (NSString *)encodedString password
                  : (NSString *)password modeInt
                  : (nonnull NSInteger *)modeInt resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject)

@end
