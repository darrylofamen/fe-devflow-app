"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/url";

const filters = [
  { name: "React", value: "react" },
  { name: "Nextjs", value: "nextjs" },
];

const HomeFilter = () => {
  const searchParams = useSearchParams();
  const filterParams = searchParams.get("filter");
  const [active, setActive] = useState(filterParams) || "";
  const router = useRouter();

  const handleFilterChange = (value: string) => {
    let newUrl;

    if (value === filterParams) {
      setActive("");

      newUrl = removeKeysFromQuery({
        searchParams: searchParams.toString(),
        keys: ["filter"],
      });

      router.push(newUrl, { scroll: false });
    } else {
      setActive(value);

      newUrl = formUrlQuery({
        searchParams: searchParams.toString(),
        key: "filter",
        value: value,
      });

      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className="mt-10 hidden flex-wrap gap-3 sm:flex">
      {filters?.map(({ name, value }) => {
        return (
          <Button
            key={value}
            className={cn(
              "body-medium cursor-pointer rounded-lg px-6 py-3 capitalize shadow-none",
              active === value
                ? "bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400"
                : "bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-300"
            )}
            onClick={() => handleFilterChange(value)}
          >
            {name}
          </Button>
        );
      })}
    </div>
  );
};
export default HomeFilter;
