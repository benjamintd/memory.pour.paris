import React, { Fragment, ReactNode } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { SortIcon } from "./SortIcon";
import { CheckIcon } from "./CheckIcon";
import { SortOption } from "@/lib/types";

export default function SortMenu({
  sortOptions,
  setSort,
  sort,
}: {
  sortOptions: {
    name: string;
    id: SortOption;
    shortName: ReactNode;
  }[];
  setSort: (sort: SortOption) => void;
  sort: SortOption;
}) {
  return (
    <div className="h-8 w-16">
      <Listbox value={sort} onChange={setSort}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full flex items-center justify-between cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300">
            <span className="font-bold text-gray-600 text-xs whitespace-nowrap">
              {sortOptions.find((o) => o.id === sort)!.shortName}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <SortIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-72 z-30 right-0 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {sortOptions.map((option) => (
                <Listbox.Option
                  key={option.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                    }`
                  }
                  value={option.id}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
