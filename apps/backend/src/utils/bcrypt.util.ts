import { compareSync, hashSync } from "bcrypt";

const saltOrRounds = 13;

export const hash = (data: string) => hashSync(data, saltOrRounds);

export const compare = (data: string, hashData: string) =>
  compareSync(data, hashData);
