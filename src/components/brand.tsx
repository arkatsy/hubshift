import Link, { LinkProps } from "next/link"
import { twMerge } from "tailwind-merge"

const baseClasses = "rounded-md font-quicksand text-3xl font-bold tracking-tight"

function Brand() {
  return (
    <>
      <span className="text-indigo-700">Hub</span>
      <span>Shift</span>
    </>
  )
}

export function BrandWithOrWithoutLink({
  isLink = false,
  className = "",
  href = "/",
}: {
  isLink: boolean
  className?: string
  href?: LinkProps["href"]
}) {
  return isLink ? (
    <Link href={href} className={twMerge(baseClasses, className)}>
      <Brand />
    </Link>
  ) : (
    <div className={twMerge(baseClasses, className)}>
      <Brand />
    </div>
  )
}
