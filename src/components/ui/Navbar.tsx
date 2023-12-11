import Link from "next/link";
import { Icons } from "../Icons";
import { buttonVariants } from "./Button";
import { UserAccountNav } from "./UserAccountNav";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SearchBar from "../SearchBar";

export const Navbar = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div className="fixed inset-x-0 top-0 z-[10] h-fit border-b border-zinc-300 bg-zinc-100 py-2">
      <div className="container mx-auto flex h-full max-w-7xl items-center justify-between gap-2">
        {/* LOGO */}
        <Link href="/" className="flex gap-2 items-center">
          <Icons.logo className="w-8 h-8" />
          <p className="hidden text-zinc-700 text-sm font-medium md:block">
            Threadit
          </p>
        </Link>

        {/*  SEARCH BAR */}
        <SearchBar />

        {session?.user ? (
          <UserAccountNav user={session.user} />
        ) : (
          <Link href="/sign-in" className={buttonVariants()}>
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
