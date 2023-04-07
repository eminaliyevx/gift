import { S3 } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class S3Service extends S3 {
  constructor(configService: ConfigService) {
    super({
      forcePathStyle: false,
      endpoint: configService.get<string>("SPACES_ENDPOINT"),
      region: "us-east-1",
      credentials: {
        accessKeyId: configService.get<string>("SPACES_KEY"),
        secretAccessKey: configService.get<string>("SPACES_SECRET"),
      },
    });
  }
}
