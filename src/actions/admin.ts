import { authClient } from "@/lib/auth-client";
import {
  updateName,
  updateEmail,
  updateEmailVerified,
} from "@/actions/update-info";

export const adminActions = {
  async deleteUser(userId: string) {
    try {
      return await authClient.admin.removeUser({ userId });
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  },

  async setRole(userId: string, role: "user" | "admin") {
    try {
      return await authClient.admin.setRole({ userId, role });
    } catch (error) {
      console.error("Failed to set role:", error);
      throw error;
    }
  },

  async setBanned(userId: string, banned: boolean) {
    try {
      if (banned) {
        return await authClient.admin.banUser({ userId });
      } else if (authClient.admin.unbanUser) {
        return await authClient.admin.unbanUser({ userId });
      }
    } catch (error) {
      console.error("Failed to update banned status:", error);
      throw error;
    }
  },

  async setName(userId: string, name: string) {
    try {
      return await updateName(userId, name);
    } catch (error) {
      console.error("Failed to update name:", error);
      throw error;
    }
  },

  async setEmail(userId: string, email: string) {
    try {
      return await updateEmail(userId, email);
    } catch (error) {
      console.error("Failed to update email:", error);
      throw error;
    }
  },

  async setEmailVerified(userId: string, emailVerified: boolean) {
    try {
      return await updateEmailVerified(userId, emailVerified);
    } catch (error) {
      console.error("Failed to update email verified status:", error);
      throw error;
    }
  },
};
