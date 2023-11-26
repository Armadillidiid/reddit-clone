"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { getAuthSession } from "@/lib/auth";

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
] as const;

const maxFileSize = 1048576 * 10; // 1 MB

type GetSignedURLParams = {
  fileType: (typeof allowedFileTypes)[number] | (string & {});
  fileSize: number;
};

type GetSignedURLResponse =
  | { failure?: undefined; success: { url: string } }
  | { failure: string };

export const getSignedURL = async ({
  fileType,
  fileSize,
}: GetSignedURLParams): Promise<GetSignedURLResponse> => {
  const session = await getAuthSession();

  if (!session) {
    return { failure: "Not authenticated" };
  }

  if (!includes(allowedFileTypes, fileType)) {
    return { failure: "File type not allowed" };
  }

  if (fileSize > maxFileSize) {
    return { failure: "File size too large" };
  }

  const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: nanoid(),
    ContentLength: fileSize,
    ContentType: fileType,
    Metadata: {
      fileType: fileType,
      fileSize: fileSize.toString(),
    },
  });

  try {
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });

    return { success: { url } };
  } catch (error) {
    console.error(error);
    return { failure: "Error creating signed URL" };
  }
};

function includes<T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T {
  return coll.includes(el as T);
}
