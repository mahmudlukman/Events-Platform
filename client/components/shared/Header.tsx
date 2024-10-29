"use client"

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogOutQuery } from "@/redux/features/auth/authApi";
import { useState } from "react";

const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [logout, setLogout] = useState(false);

  const {} = useLogOutQuery(undefined, {
    skip: !logout,
  });

  const getAvatarSrc = () => {
    if (user?.avatar?.url) {
      return user.avatar.url;
    }
    if (user?.image) {
      return user.image;
    }
    return "";
  };

  const getUserInitials = () => {
    const name = user?.name;
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleSignOut = () => {
    setLogout(true);
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-8 w-8">
          <AvatarImage src={getAvatarSrc()} />
          <AvatarFallback>{getUserInitials()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="w-full border-b">
      <div className="wrapper flex items-center justify-between">
        <Link href="/" className="w-36">
          <Image
            src="/assets/images/logo.svg"
            width={128}
            height={38}
            alt="Evently logo"
          />
        </Link>

        {user && (
          <nav className="md:flex-between hidden w-full max-w-xs">
            <NavItems />
          </nav>
        )}

        <div className="flex w-32 justify-end gap-3">
          {user ? (
            <>
              <UserMenu />
              <MobileNav />
            </>
          ) : (
            <Button asChild className="rounded-full" size="lg">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
