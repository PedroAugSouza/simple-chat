export interface InputRegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface InputLoginUser {
  email: string;
  password: string;
}

export interface OutputLoginUser {
  token: string;
}
