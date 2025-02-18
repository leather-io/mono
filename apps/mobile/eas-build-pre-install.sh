echo $GOOGLE_SERVICES_JSON_B64 | base64 --decode > ./android/app/google-services.json
echo $GOOGLE_SERVICES_INFO_PLIST_B64 | base64 --decode > ./ios/leatherwalletmobile/GoogleService-Info.plist