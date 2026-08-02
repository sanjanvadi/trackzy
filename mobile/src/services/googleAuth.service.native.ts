import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import {
  signInWithGoogleCredential,
} from "@pricava/react-native-google-credential";

import { auth } from "@/src/config/firebase";


export const signInWithGoogleNative = async () => {

  try {

    const credential =
      await signInWithGoogleCredential({
        webClientId:
          process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
      });


    if (!credential.idToken) {
      throw new Error(
        "Google ID token missing"
      );
    }


    const firebaseCredential =
      GoogleAuthProvider.credential(
        credential.idToken
      );


    const result =
      await signInWithCredential(
        auth,
        firebaseCredential
      );


    return result.user;


  } catch(error:any) {

    console.error(
      "Native Google login error:",
      error
    );

    throw error;
  }
};