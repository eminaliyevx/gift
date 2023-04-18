import { compareSync, hashSync } from "bcryptjs";

const saltOrRounds = 13;

export const hash = (data: string) => hashSync(data, saltOrRounds);

export const compare = (data: string, hashData: string) =>
  compareSync(data, hashData);
