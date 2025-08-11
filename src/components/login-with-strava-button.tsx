"use client";

import { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

type Props = {
  callbackURL?: string;
  children?: ReactNode;
  className?: string;
  imgClassName?: string;
};

export function LoginWithStravaButton({
  callbackURL = "/",
  className,
  imgClassName,
}: Props) {
  const handleLogin = async () => {
    await authClient.signIn.oauth2({
      providerId: "strava",
      callbackURL,
      errorCallbackURL: callbackURL,
      disableRedirect: false,
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      className={
        "inline-flex items-center justify-center focus:outline-none " +
        (className || "")
      }
      aria-label="Connect with Strava"
    >
      <img
        src="/images/btn_strava_connect_with_orange_x2.svg"
        alt="Connect with Strava"
        className={imgClassName || "h-10 w-auto sm:h-12"}
      />
    </button>
  );
}
