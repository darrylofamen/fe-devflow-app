import React from "react";
import Navbar from "@/components/navigation/navbar";
import LeftSidebar from "@/components/navigation/LeftSidebar";

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <main>
      <Navbar />
      <div className="flex">
        <LeftSidebar />

        <section className="flex min-h-screen flex-1 flex-col px-6 pt-36 pb-6 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default RootLayout;
