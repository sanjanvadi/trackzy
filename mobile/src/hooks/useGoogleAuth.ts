import { Platform } from "react-native";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";


import {
  signInWithGoogleNative
} from "@/src/services/googleAuth.service.native";

import {
  signInWithGoogleWeb
} from "@/src/services/googleAuth.service.web";


WebBrowser.maybeCompleteAuthSession();


export const useGoogleAuth = () => {


  const [request, response, promptAsync] =
    Google.useIdTokenAuthRequest({

      clientId:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,

      redirectUri:
        "https://auth.expo.io/@sanjanv/trackzy"

    });



  const signInGoogle = async () => {


    if (Platform.OS === "web") {
      return await signInWithGoogleWeb();
    }


    const result = await promptAsync();


    console.log(
      "Google Result:",
      result
    );


    if (result.type !== "success") {
      throw new Error(
        "Google login failed"
      );
    }


    return await signInWithGoogleNative(
      result.params.id_token
    );

  };


  return {
    request,
    response,
    signInGoogle,
  };

};