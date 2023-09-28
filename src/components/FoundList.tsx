import { Transition } from "@headlessui/react";
import classNames from "classnames";
import StreetIcon from "@/components/StreetIcon";
import { METRO } from "@/lib/constants";
import SortMenu from "@/components/SortMenu";
import { useMemo, useState } from "react";
import { SortOption, DataFeature, SortOptionType } from "@/lib/types";
import { TimerIcon } from "./TimerIcon";
import { sortBy } from "lodash";

const FoundList = ({
  found,
  idMap,
  setHoveredId,
  hoveredId,
  hideLabels,
  foundStreetsKm,
}: {
  found: number[];
  foundStreetsKm: number;
  idMap: Map<number, DataFeature>;
  setHoveredId: (id: number | null) => void;
  hoveredId: number | null;
  hideLabels?: boolean;
}) => {
  const sortOptions: SortOption[] = useMemo(() => {
    return [
      {
        name: "Chronologique",
        id: "order",
        shortName: <TimerIcon className="h-4 w-4" />,
      },
      { name: "Nom", id: "name", shortName: "A-Z" },
      { name: "Longueur", id: "length", shortName: "km" },
      { name: "Ligne", id: "line", shortName: "1-9" },
    ];
  }, []);

  const [sort, setSort] = useState<SortOptionType>("order");

  const sorted = useMemo(() => {
    switch (sort) {
      case "order":
        return found;

      case "name":
        return sortBy(found, (id) => {
          const feature = idMap.get(id);
          if (!feature) return null;
          return feature.properties.name;
        });

      case "length":
        return sortBy(found, (id) => {
          const feature = idMap.get(id);
          if (!feature) return null;
          return -(feature.properties.length || 0);
        });

      case "line":
        return sortBy(
          found,
          (id) => {
            const feature = idMap.get(id);
            if (!feature) return null;
            if (!feature.properties.line) return Infinity;
            return METRO[feature.properties.line].order || Infinity;
          },
          // then by location, roughly
          (id) => {
            const feature = idMap.get(id);
            if (!feature) return null;
            if (feature.geometry.type === "Point") {
              return (
                100 * feature.geometry.coordinates[0] +
                feature.geometry.coordinates[1]
              );
            } else {
              return feature.properties.name;
            }
          }
        );

      default:
        return found;
    }
  }, [found, sort, idMap]);

  return (
    <div>
      {sorted.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm uppercase text-blue-900">
              {sorted.length} éléments
            </p>
            <p className="text-xs uppercase text-blue-900">
              {foundStreetsKm.toFixed(1)} km de rues
            </p>
          </div>

          <SortMenu sortOptions={sortOptions} sort={sort} setSort={setSort} />
        </div>
      )}
      <ol className={classNames({ "transition-all blur-md": hideLabels })}>
        {sorted.map((id) => {
          const feature = idMap.get(id);
          if (!feature) return null;
          return (
            <Transition
              appear={true}
              as="li"
              key={id}
              show={true}
              enter="transition-all duration-250"
              enterFrom="h-0 opacity-0"
              enterTo="h-8 opacity-100"
              leave="transition-opacity duration-250"
              leaveFrom="h-8 opacity-100"
              leaveTo="h-0 opacity-0"
            >
              <div
                onMouseOver={() => setHoveredId(id)}
                onMouseOut={() => setHoveredId(null)}
                className={classNames(
                  "w-full rounded text-sm flex items-center px-2 py-1",
                  {
                    "bg-yellow-400 shadow-sm": feature.id === hoveredId,
                  }
                )}
              >
                {feature.properties.line ? (
                  <span
                    className="w-5 h-5 rounded-full font-bold text-xs flex items-center justify-center mr-2"
                    style={{
                      backgroundColor: METRO[feature.properties.line].color,
                      color: METRO[feature.properties.line].textColor,
                    }}
                  >
                    {METRO[feature.properties.line].name}
                  </span>
                ) : (
                  <StreetIcon className="w-5 h-5 mr-2" />
                )}
                <span className="max-w-md truncate">
                  {feature.properties.long_name || feature.properties.name}
                </span>
                {!!feature.properties.length && (
                  <span className="font-sans font-light ml-auto">
                    {feature.properties.length.toFixed(1)} km
                  </span>
                )}
              </div>
            </Transition>
          );
        })}
      </ol>
    </div>
  );
};

export default FoundList;
