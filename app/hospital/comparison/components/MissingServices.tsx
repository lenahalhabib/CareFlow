"use client";

import {
  useState,
} from "react";

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type MissingServicesProps = {
  items: string[];
};

export default function MissingServices({
  items,
}: MissingServicesProps) {
  const [
    opened,
    setOpened,
  ] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-xl bg-yellow-50">
      <button
        type="button"
        onClick={() =>
          setOpened(
            (current) => !current
          )
        }
        aria-expanded={opened}
        className="flex w-full items-center justify-between gap-3 p-3 text-left text-yellow-800"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={18} />

          <div>
            <p className="text-sm font-semibold">
              Services Not Available
            </p>

            <p className="mt-0.5 text-xs text-yellow-800/65">
              {items.length}{" "}
              {items.length === 1
                ? "service"
                : "services"}
            </p>
          </div>
        </div>

        {opened ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} />
        )}
      </button>

      {opened && (
        <div className="border-t border-yellow-200 p-3">
          <ul className="space-y-2 text-sm text-yellow-800">
            {items.map(
              (item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="rounded-2xl bg-white/70 px-4 py-3"
                >
                  • {item}
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </section>
  );
}