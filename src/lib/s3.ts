import { getSignedURL } from "@/actions/upload/getSignedURL";
import axios from "axios";

export const uploadImageToS3 = async (file: File): Promise<string> => {
  const res = await getSignedURL({ fileType: file.type, fileSize: file.size });
  if (res.failure !== undefined) {
    throw new Error(res.failure);
  }

  const { url } = res.success;
  try {
    await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return url.split("?")[0];
  } catch (error) {
    throw new Error("Error uploading file to S3");
  }
};
