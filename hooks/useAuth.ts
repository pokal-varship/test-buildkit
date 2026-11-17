import { useSession } from "next-auth/react";
import { ExtendedSession } from "@components/header/types";

/**
 * Custom hook for authentication status and user data
 * @returns Object containing authentication status, session data, and helper functions
 */
export const useAuth = () => {
  const { data: session, status } = useSession() as { 
    data: ExtendedSession | null; 
    status: "loading" | "authenticated" | "unauthenticated";
  };

  // Check if user is authenticated with valid email
 const isAuthenticated = status === "authenticated" && session?.user?.email && session?.user?.isAuthenticated;

  // Check if authentication is still loading
  const isLoading = status === "loading";

  // Check if user is unauthenticated
  const isUnauthenticated = status === "unauthenticated";

  // Get user data safely
  const user = session?.user || null;

  // Get user email safely
  const userEmail = session?.user?.email || null;

  // Get user ID safely - check both session.userId and session.user.userId
  const userId = session?.userId || session?.user?.userId || session?.user?.id || null;

  return {
    // Authentication status
    isAuthenticated,
    isLoading,
    isUnauthenticated,
    
    // Session data
    session,
    user,
    userEmail,
    userId,
    
    // Status
    status,
  };
};

export default useAuth;
