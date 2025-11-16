"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/url";

interface Props {
  route: string;
  icon: string;
  className?: string;
  placeholder: string;
}

const LocalSearch = ({ route, icon, className, placeholder }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get("query") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const previousSearchQueryRef = useRef(searchQuery);

  useEffect(() => {
    // Only trigger if searchQuery actually changed
    if (previousSearchQueryRef.current === searchQuery) return;
    previousSearchQueryRef.current = searchQuery;

    // Debounce the search query update
    const debounceFn = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          searchParams: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });

        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === route) {
          const newUrl = removeKeysFromQuery({
            searchParams: searchParams.toString(),
            keys: ["query"],
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 500);

    // Clean up the debounce function on a component unmount
    return () => clearTimeout(debounceFn);
  }, [searchParams, searchQuery, router, route, pathname]);

  return (
    <div
      className={cn(
        "background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4",
        className
      )}
    >
      <Image src={icon} alt="Search Icon" width={24} height={24} className="cursor-pointer" />
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        className="dark:bg-background-light800_darkgradient paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
    </div>
  );
};
export default LocalSearch;
