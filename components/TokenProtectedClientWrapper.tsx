"use client";

import React from "react";
import UnauthorizedAccess from "components/UnauthorizedAccess";
import { validateToken } from "lib/tokenValidation";

interface TokenProtectedClientWrapperProps {
  token: string | null;
  children: React.ReactNode;
  message?: string;
}

export default function TokenProtectedClientWrapper({
  token,
  children,
  message = "You are not allowed to view this page. A valid authentication token is required.",
}: TokenProtectedClientWrapperProps) {
  if (!validateToken(token)) {
    return (
      <UnauthorizedAccess
        message={message}
        showReturnHome={true}
      />
    );
  }

  return <>{children}</>;
}
