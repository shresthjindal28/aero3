"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Shield, User } from "lucide-react";

import { routes } from "@/shared/constants/routes";
import { StorageAvatar } from "@/shared/ui/primitives/storage-avatar";
import { Button } from "@/shared/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/primitives/dropdown-menu";

type UserMenuProps = {
  name: string;
  email: string;
  avatarUrl?: string | null;
  actorType: "doctor" | "admin";
  onLogout: () => void;
};

export function UserMenu({
  name,
  email,
  avatarUrl,
  actorType,
  onLogout,
}: UserMenuProps) {
  const router = useRouter();

  const profileRoute =
    actorType === "admin"
      ? routes.admin.settingsProfile
      : routes.app.settingsProfile;

  const securityRoute = routes.app.settingsSecurity;

  const handleLogout = () => {
    onLogout();
    router.replace(
      actorType === "admin" ? routes.auth.adminLogin : routes.auth.doctorLogin,
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <StorageAvatar name={name} imageRef={avatarUrl} className="h-7 w-7" />
          <span className="hidden text-sm font-medium md:inline">{name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{name}</span>
            <span className="text-xs font-normal text-muted-foreground">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={profileRoute} className="cursor-pointer">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        {actorType === "doctor" ? (
          <DropdownMenuItem asChild>
            <Link href={securityRoute} className="cursor-pointer">
              <Shield className="h-4 w-4" />
              Security
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
