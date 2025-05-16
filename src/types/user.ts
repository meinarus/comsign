export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: "user" | "admin";
  banned: boolean;
  createdAt: string;
}
