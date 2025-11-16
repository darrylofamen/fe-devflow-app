import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { Button } from "@/components/ui/button";
import NavLinks from "@/components/navigation/navbar/NavLinks";

const MobileNavigation = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Image
          src="/icons/hamburger.svg"
          alt="Menu"
          width={36}
          height={36}
          className="invert-colors cursor-pointer sm:hidden"
        />
      </SheetTrigger>
      <SheetContent side="left" className="background-light900_dark200 border-none">
        <SheetHeader>
          <SheetTitle className="hidden">Navigation</SheetTitle>
          <Link href="/" className="flex items-center gap-1">
            <Image src="/images/site-logo.svg" alt="Dev Overflow Logo" width={23} height={23} />

            <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900">
              Dev<span className="text-primary-500">Flow</span>
            </p>
          </Link>

          <div className="no-scrollbar flex h-[calc(100vh-80px)] flex-col justify-between overflow-y-auto">
            <SheetClose asChild>
              <section className="flex h-full flex-col gap-6 pt-16">
                <NavLinks isMobileNav />
              </section>
            </SheetClose>

            <div className="flex flex-col gap-3">
              <SheetClose asChild>
                <Link href={ROUTES.SIGN_IN}>
                  <Button className="small-medium btn-secondary min-h-[41px] w-full cursor-pointer rounded-lg px-4 py-3 shadow-none">
                    <span className="primary-text-gradient">Log In</span>
                  </Button>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link href={ROUTES.SIGN_UP}>
                  <Button className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full cursor-pointer rounded-lg border px-4 py-3 shadow-none">
                    Sign up
                  </Button>
                </Link>
              </SheetClose>
            </div>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
export default MobileNavigation;
