import { signIn, signOut } from "@/lib/auth";

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("strava");
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center justify-center focus:outline-none"
      >
        <img
          src="/images/btn_strava_connect_with_orange_x2.svg"
          alt="Connect with Strava"
          className="h-10 w-auto sm:h-12"
        />
      </button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button
        type="submit"
        className="bg-gray-500 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </form>
  );
}
