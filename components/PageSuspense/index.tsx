import * as React from "react";
import { Suspense } from "react";
import Loader from '@components/loader/Loader';

interface PageSuspenseProps {
    children: React.ReactNode;
}

const PageSuspense: React.FC<PageSuspenseProps> = ({ children }) => (
  <Suspense
    fallback={
      <div
        style={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader />
      </div>
    }
  >
    {children}
  </Suspense>
);

export default PageSuspense;

