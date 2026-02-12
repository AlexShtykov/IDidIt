import { useUpdateProfile } from './useUpdateProfile';

/** В PocketBase файлы загружаются через FormData при update */
export function useUploadAvatar() {
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const uploadAvatar = async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return updateProfile({ userId, data: formData });
  };

  return { uploadAvatar, isUploading: isPending };
}
