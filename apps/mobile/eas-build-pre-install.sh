echo $GOOGLE_SERVICES_JSON_BASE64 | base64 --decode > ./android/app/google-services.json
echo $GOOGLE_SERVICES_INFO_PLIST_BASE64 | base64 --decode > ./ios/leatherwalletmobile/GoogleService-Info.plist