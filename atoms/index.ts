import { atom } from "recoil";

export const accessTokenState = atom({
  key: 'accessTokenState',
  default: "",
});
export const rolesState = atom<string[]>({
  key: 'rolesState',
  default: [],
});
export const defaultRoles = {
  accreditation: "accreditation",
  checker: "checker",
  launch: "launch",
  swag: "swag",
  information: "information",
  special_point: "special_point",
  revocation: "revocation",
  combo: "combo",
}