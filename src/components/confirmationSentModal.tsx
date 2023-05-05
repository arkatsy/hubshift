import { Dialog, Transition } from "@headlessui/react"
import Link from "next/link"
import { Fragment, useState } from "react"

export function ConfirmationSentModal() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Transition as={Fragment} appear show={isOpen}>
      <Dialog as="div" onClose={() => {}} className="z-10">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="pointer-events-none fixed inset-0 bg-black/50" aria-hidden={true} />
        </Transition.Child>
        <div className="overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="absolute left-1/2 top-1/3 w-full max-w-md
              -translate-x-1/2 -translate-y-1/2 transform rounded-md border-zinc-200 bg-zinc-100 px-6 
              py-8 transition-all dark:border-zinc-600 dark:bg-zinc-800"
              >
                <Dialog.Title as="h3" className="text-xl font-bold sm:text-2xl">
                  Thank you for registering!
                </Dialog.Title>
                <Dialog.Description as="div">
                  <p className="my-4 block text-xl font-semibold">
                    Please check your email to confirm your account.
                  </p>
                  <Link
                    href={"/"}
                    className="my-12 rounded-md px-2 py-1 text-indigo-700 hover:underline dark:text-indigo-600"
                  >
                    Return to home
                  </Link>
                </Dialog.Description>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
