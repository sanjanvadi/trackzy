import { Platform } from "react-native";

import { signInWithGoogleWeb } from "@/src/services/googleAuth.service.web";
import { signInWithGoogleNative } from "@/src/services/googleAuth.service.native";


export const useGoogleAuth = () => {

  const signInGoogle = async () => {

    if (Platform.OS === "web") {
      return await signInWithGoogleWeb();
    }


    return await signInWithGoogleNative();
  };


  return {
    signInGoogle,
  };
};