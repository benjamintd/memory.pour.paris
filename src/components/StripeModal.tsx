import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function StripeModal({
  open,
  setOpen,
  metroFoundProportion,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  metroFoundProportion: number;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-bold leading-6 text-gray-900 text-left"
                    >
                      Bien joué, vous avez atteint les{" "}
                      {10 * Math.floor((metroFoundProportion * 100) / 10)} % !
                    </Dialog.Title>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <p className="text-sm mb-2">Ce jeu est gratuit.</p>
                  <p className="text-sm mb-4">
                    Soutenez le développement de{" "}
                    <strong>memory.pour.paris</strong> en faisant un don libre.
                  </p>

                  <p className="mb-2 text-xs text-gray-700">
                    Ce lien ouvre un nouvel onglet et votre progression reste
                    sauvegardée.
                  </p>
                  <a
                    rel="noreferrer"
                    target="_blank"
                    href="https://buy.stripe.com/8wM00x0nI8Ua0EM4gg"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 mb-2"
                    onClick={() => setOpen(false)}
                  >
                    Soutenir le projet
                  </a>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    Retour
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
