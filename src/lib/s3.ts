import { getSignedURL } from "@/actions/upload/getSignedURL";
import axios from "axios";

export const uploadImageToS3 = async (file: File): Promise<string | null> => {
  const res = await getSignedURL({ fileType: file.type, fileSize: file.size });
  if (res.failure !== undefined) {
    console.error(res.failure);
    return res.failure;
  }

  const { url } = res.success;
  try {
    await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    console.log("File uploaded to S3", url);
    return url.split("?")[0];
  } catch (error) {
    console.error("Error uploading file to S3", error);
    return null;
  }
};
