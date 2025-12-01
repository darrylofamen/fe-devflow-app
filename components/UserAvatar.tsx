import React from "react";
import Link from "next/link";
import ROUTES from "@/constants/routes";

interface Props {
  id: string;
  name: string;
  image?: string;
  className?: string;
  fallbackClassName?: string;
}

const UserAvatar = ({ id, name, image, className = "h-9 w-9", fallbackClassName }: Props) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={ROUTES.PROFILE(id)}>
      {/*<Avatar className={className}>*/}
      {/*  {image ? (*/}
      {/*    <AvatarImage src={image} alt={name} />*/}
      {/*  ) : (*/}
      {/*    <AvatarFallback*/}
      {/*      className={cn("primary-gradient font-space-grotesk font-bold tracking-wide text-white", fallbackClassName)}*/}
      {/*    >*/}
      {/*      {initials}*/}
      {/*    </AvatarFallback>*/}
      {/*  )}*/}
      {/*</Avatar>*/}
    </Link>
  );
};
export default UserAvatar;
