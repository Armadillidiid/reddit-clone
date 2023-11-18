import { Sha256 } from "@aws-crypto/sha256-browser";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
const region = process.env.NEXT_PUBLIC_AWS_BUCKET_REGION;
const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY;
const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region: region,
  credentials: {
    accessKeyId: accessKeyId ?? "",
    secretAccessKey: secretAccessKey ?? "",
  },
  sha256: Sha256,
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
    const imageUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: bucketName ?? "",
      Key: params.Key ?? "",
    }), {
      expiresIn: 3600,
    });
    return imageUrl;
  } catch (error) {
    throw error;
  }
};
