import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";
import { randomUUID } from "crypto";

@Injectable()
export class UploadService {
  private minioClient: Minio.Client;
  private bucket: string;
  private publicEndpoint: string;
  private publicPort: string;
  private publicUseSSL: boolean;

  constructor(private configService: ConfigService) {
    const endpoint = configService.get("MINIO_ENDPOINT", "localhost");
    const port = configService.get<number>("MINIO_PORT", 9000);
    const useSSL = configService.get("MINIO_USE_SSL", "false") === "true";
    const accessKey = configService.get("MINIO_ACCESS_KEY", "minioadmin");
    const secretKey = configService.get("MINIO_SECRET_KEY", "minioadmin");

    this.minioClient = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    this.bucket = configService.get("MINIO_BUCKET", "bangumi");
    this.publicEndpoint = configService.get("MINIO_PUBLIC_ENDPOINT", "localhost");
    this.publicPort = configService.get("MINIO_PORT", "9000");
    this.publicUseSSL = useSSL;
  }

  async ensureBucket() {
    const exists = await this.minioClient.bucketExists(this.bucket);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucket);
      const policy = JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: ["arn:aws:s3:::" + this.bucket + "/*"],
          },
        ],
      });
      await this.minioClient.setBucketPolicy(this.bucket, policy);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const ext = file.originalname.split(".").pop() || "bin";
    const key = "uploads/" + Date.now() + "-" + randomUUID().slice(0, 8) + "." + ext;

    await this.minioClient.putObject(this.bucket, key, file.buffer, file.size, {
      "Content-Type": file.mimetype,
    });

    return { key, url: this.getPublicUrl(key) };
  }

  async getPresignedUrl(filename: string, contentType: string) {
    const ext = filename.split(".").pop() || "bin";
    const key = "uploads/" + Date.now() + "-" + randomUUID().slice(0, 8) + "." + ext;

    const url = await this.minioClient.presignedPutObject(this.bucket, key, 3600);
    return { url, key };
  }

  getPublicUrl(key: string) {
    const protocol = this.publicUseSSL ? "https" : "http";
    return protocol + "://" + this.publicEndpoint + ":" + this.publicPort + "/" + this.bucket + "/" + key;
  }
}