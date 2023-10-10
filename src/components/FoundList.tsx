import { Transition } from "@headlessui/react";
import classNames from "classnames";
import StreetIcon from "@/components/StreetIcon";
import { LINES } from "@/lib/constants";
import SortMenu from "@/components/SortMenu";
import { Fragment, memo, useMemo, useState } from "react";
import { SortOption, DataFeature, SortOptionType } from "@/lib/types";
import { DateAddedIcon } from "./DateAddedIcon";
import { sortBy } from "lodash";
import Image from "next/image";
import AdBlock from "./Ad";

const FoundList = ({
  found,
  idMap,
  setHoveredId,
  hoveredId,
  hideLabels,
  foundStreetsKm,
  zoomToFeature,
  includeStreets = false,
}: {
  found: number[];
  foundStreetsKm?: number;
  idMap: Map<number, DataFeature>;
  setHoveredId: (id: number | null) => void;
  hoveredId: number | null;
  hideLabels?: boolean;
  zoomToFeature: (id: number) => void;
  includeStreets?: boolean;
}) => {
  const sortOptions: SortOption[] = useMemo(() => {
    return [
      {
        name: "Ordre d'ajout",
        id: "order",
        shortName: <DateAddedIcon className="h-4 w-4" />,
      },
      { name: "Nom", id: "name", shortName: "A-Z" },
      ...(includeStreets
        ? ([{ name: "Longueur", id: "length", shortName: "km" }] as const)
        : []),
      { name: "Ligne", id: "line", shortName: "1-9" },
    ];
  }, [includeStreets]);

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
            return LINES[feature.properties.line]?.order || Infinity;
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

  const grouped = useMemo(() => {
    const grouped = [];
    let lastName = "";
    let lastType = "";
    for (let id of sorted) {
      const feature = idMap.get(id);
      if (!feature) continue;

      if (
        (feature.properties.long_name || feature.properties.name) ===
          lastName &&
        feature.properties.type === lastType
      ) {
        grouped[grouped.length - 1].push(feature);
      } else {
        grouped.push([feature]);
        lastName = feature.properties.long_name || feature.properties.name;
        lastType = feature.properties.type;
      }
    }

    return grouped;
  }, [sorted, idMap]);

  return (
    <div>
      {sorted.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm uppercase text-blue-900 text-opacity-75">
              {sorted.length} station{sorted.length > 1 ? "s" : ""}
            </p>
            {foundStreetsKm !== undefined && (
              <p className="text-xs uppercase text-blue-900">
                {foundStreetsKm.toFixed(1)} km de rues
              </p>
            )}
          </div>

          <SortMenu sortOptions={sortOptions} sort={sort} setSort={setSort} />
        </div>
      )}
      <ol className={classNames({ "transition-all blur-md": hideLabels })}>
        {grouped.map((features, i) => {
          if (i % 10 === 9) {
            return (
              <Fragment key={features[0].id}>
                <GroupedLine
                  key={features[0].id}
                  features={features}
                  zoomToFeature={zoomToFeature}
                  setHoveredId={setHoveredId}
                  hoveredId={hoveredId}
                />
                <AdBlock />
              </Fragment>
            );
          }
          return (
            <GroupedLine
              key={features[0].id}
              features={features}
              zoomToFeature={zoomToFeature}
              setHoveredId={setHoveredId}
              hoveredId={hoveredId}
            />
          );
        })}
      </ol>
    </div>
  );
};

const GroupedLine = memo(
  ({
    features,
    zoomToFeature,
    setHoveredId,
    hoveredId,
  }: {
    features: DataFeature[];
    zoomToFeature: (id: number) => void;
    setHoveredId: (id: number | null) => void;
    hoveredId: number | null;
  }) => {
    const length = useMemo(() => {
      return features.reduce((acc, feature) => {
        if (feature.properties.length) {
          return acc + feature.properties.length;
        } else {
          return acc;
        }
      }, 0);
    }, [features]);

    const times = features.length;

    return (
      <Transition
        appear={true}
        as="li"
        key={features[0].id}
        show={true}
        enter="transition-all duration-250"
        enterFrom="h-0 opacity-0"
        enterTo="h-8 opacity-100"
        leave="transition-opacity duration-250"
        leaveFrom="h-8 opacity-100"
        leaveTo="h-0 opacity-0"
      >
        <button
          onClick={() => zoomToFeature(features[0].properties.id!)}
          onMouseOver={() => setHoveredId(+features[0].id!)}
          onMouseOut={() => setHoveredId(null)}
          className={classNames(
            "w-full rounded text-sm flex items-center px-2 py-1",
            {
              "bg-yellow-400 shadow-sm": features.some(
                (f) => f.id === hoveredId
              ),
            }
          )}
        >
          {sortBy(features, (f) => LINES[f.properties.line || ""]?.order).map(
            (feature) => {
              return feature.properties.line ? (
                <Image
                  key={feature.id!}
                  alt={feature.properties.line}
                  src={`/images/${LINES[feature.properties.line]?.name}.png`}
                  width={64}
                  height={64}
                  className="w-5 h-5 -mr-0.5"
                />
              ) : (
                <StreetIcon key={feature.id!} className="w-5 h-5 -mr-0.5" />
              );
            }
          )}

          <span className="ml-2.5 max-w-md truncate">
            {features[0].properties.long_name || features[0].properties.name}
          </span>
          {!!length ? (
            <span className="font-sans font-light ml-auto text-gray-500">
              {length.toFixed(1)} km
            </span>
          ) : times > 1 ? (
            <span className="font-sans font-light ml-auto text-gray-500">
              ｘ{times}
            </span>
          ) : null}
        </button>
      </Transition>
    );
  }
);
GroupedLine.displayName = "GroupedLine";

export default FoundList;
