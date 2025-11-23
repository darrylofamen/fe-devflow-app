import React from "react";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  id: string;
  name: string;
  image?: string;
  className?: string;
}

const UserAvatar = ({ id, name, image, className = "h-9 w-9" }: Props) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={ROUTES.PROFILE(id)}>
      <Avatar className={className}>
        {image ? (
          <AvatarImage src={image} alt={name} />
        ) : (
          <AvatarFallback className="primary-gradient font-space-grotesk font-bold tracking-wide text-white">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
    </Link>
  );
};
export default UserAvatar;
