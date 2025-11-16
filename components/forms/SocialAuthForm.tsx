"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import ROUTES from "@/constants/routes";

const SocialAuthForm = () => {
  const buttonClass =
    "background-dark400_light900 body-medium text-dark200_light800 rounded-2 flex-1 px-4 py-3.5 cursor-pointer";

  const handleSignIn = async (provider: "github" | "google") => {
    try {
      await signIn(provider, { redirectTo: ROUTES.HOME });
    } catch (error) {
      console.log(error);

      toast("Sign-in failed", {
        description: error instanceof Error ? error.message : "An error occurred during sign-in",
        style: {
          backgroundColor: "#f8d7da",
          color: "#721c24",
          border: "1px solid #f5c6cb",
        },
      });
    }
  };

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button className={buttonClass} onClick={() => handleSignIn("github")}>
        <Image
          src="/icons/github.svg"
          alt="Github Logo"
          width={20}
          height={20}
          className="invert-colors mr-2.5 object-contain"
        />
        <p>Log in with Github</p>
      </Button>

      <Button className={buttonClass} onClick={() => handleSignIn("google")}>
        <Image src="/icons/google.svg" alt="Github Logo" width={20} height={20} className="mr-2.5 object-contain" />
        <p>Log in with Google</p>
      </Button>
    </div>
  );
};
export default SocialAuthForm;
