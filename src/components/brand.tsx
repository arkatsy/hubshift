import Link, { type LinkProps } from "next/link"
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
  ...props
}: {
  isLink: boolean
  className?: string
  href?: LinkProps["href"]
  [key: string]: any
}) {
  return isLink ? (
    <Link href={href} className={twMerge(baseClasses, className)} {...props}>
      <Brand />
    </Link>
  ) : (
    <div className={twMerge(baseClasses, className)}>
      <Brand />
    </div>
  )
}
