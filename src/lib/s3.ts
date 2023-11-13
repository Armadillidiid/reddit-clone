import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region: region,
  credentials: {
    accessKeyId: accessKeyId ?? "",
    secretAccessKey: secretAccessKey ?? "",
  },
});

export const uploadImageToS3 = async (file: File): Promise<string> => {
  // upload details to send to S3
  const params: PutObjectCommandInput = {
    Bucket: bucketName ?? "",
    Key: `${nanoid()}-${file.name}`,
    Body: file,
    ContentType: file.type,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    const imageUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    console.log("Image uploaded successfully:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};
