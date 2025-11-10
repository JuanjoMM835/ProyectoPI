import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase/firebase";

/**
 * ✅ Subir foto del perfil
 */
export const uploadProfilePhoto = async (uid: string, file: File) => {
  const storageRef = ref(storage, `profilePictures/${uid}`);
  await uploadBytes(storageRef, file);

  const photoURL = await getDownloadURL(storageRef);

  await updateDoc(doc(db, "users", uid), {
    photoURL,
  });

  return photoURL;
};

/**
 * ✅ Actualizar nombre del usuario
 */
export const updateUserName = async (uid: string, name: string) => {
  await updateDoc(doc(db, "users", uid), {
    name,
  });
};
