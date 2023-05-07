import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"

type ModalProps = {
  children: React.ReactNode
}

export function Modal({ children }: ModalProps) {
  const [isOpen, _] = useState(true)

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
              {children}
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
