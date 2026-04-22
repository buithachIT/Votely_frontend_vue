export interface IBackendRes<T> {
  success: boolean;
  data: T;
  message: string;
  errors: unknown;
}
export interface IBackendError {
  success: boolean;
  message: string;
  statusCode?: number;
  errors?: unknown;
}
export interface ILoginResponse {
  accessToken: string;
  user: IUser;
}
export interface IPollOption {
  text: string;
  votes: number;
  image: string | null;
}

export interface IPoll {
  _id: string;
  title: string;
  description: string;
  code: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  options: IPollOption[];
  multipleSelection: boolean;
  maxSelections: number;
  isActive: boolean;
  chatEnabled: boolean;
  votedUsers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IChatMessage {
  _id?: string;
  pollCode: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

export interface ICreatePollOptionPayload {
  text: string;
  image?: string;
}

export interface ICreatePollPayload {
  title: string;
  description: string;
  options: ICreatePollOptionPayload[];
  multipleSelection: boolean;
  maxSelections: number;
}

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
