import {
  GoogleAuthProvider,
  signInWithCredential,
  User,
} from "firebase/auth";

import { auth } from "@/src/config/firebase";


export const signInWithGoogleNative = async (
  idToken: string
): Promise<User> => {

  const credential =
    GoogleAuthProvider.credential(idToken);


  const result =
    await signInWithCredential(
      auth,
      credential
    );


  return result.user;
};