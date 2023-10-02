import removeAccents from "@/lib/removeAccents";
import classNames from "classnames";
import { useState, KeyboardEventHandler, useCallback } from "react";
import Fuse from "fuse.js";
import { DataFeature } from "@/lib/types";

const Input = ({
  fuse,
  found,
  setFound,
  setIsNewPlayer,
  inputRef,
  map,
  idMap,
}: {
  fuse: Fuse<DataFeature>;
  found: number[];
  setFound: (found: number[]) => void;
  setIsNewPlayer: (isNewPlayer: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  map: mapboxgl.Map | null;
  idMap: Map<number, DataFeature>;
}) => {
  const [search, setSearch] = useState<string>("");
  const [wrong, setWrong] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key !== "Enter") return;
      if (!search) return;

      e.preventDefault();

      const sanitizedSearch = removeAccents(search);
      const results = fuse.search(sanitizedSearch);

      const matches: number[] = [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (
          result.matches &&
          result.matches.length &&
          result.matches.some(
            (match) =>
              match.indices[0][0] < 2 &&
              match.value!.length - match.indices[match.indices.length - 1][1] <
                2 &&
              Math.abs(match.value!.length - sanitizedSearch.length) < 4
          ) &&
          (found || []).indexOf(+result.item.id!) === -1
        ) {
          matches.push(+result.item.id!);
        }
      }

      if (matches.length === 0) {
        setWrong(true);
        setTimeout(() => setWrong(false), 500);
        return;
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 500);
        if (map) {
          (map.getSource("hovered") as mapboxgl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features: (matches || []).map((id) => idMap.get(id)!),
          });

          setTimeout(() => {
            (map.getSource("hovered") as mapboxgl.GeoJSONSource).setData({
              type: "FeatureCollection",
              features: [],
            });
          }, 1500);
        }

        setFound([...matches, ...(found || [])]);
        setIsNewPlayer(false);
        setSearch("");
      }
    },
    [
      search,
      setSearch,
      fuse,
      found,
      setFound,
      setWrong,
      setIsNewPlayer,
      map,
      idMap,
    ]
  );

  return (
    <input
      className={classNames(
        {
          "animate animate-shake": wrong,
          "!shadow-yellow-500 shadow-inner duration-500": success,
        },
        "transition-shadow z-40 grow px-4 py-2 rounded-full text-lg font-bold shadow-lg text-blue-900 outline-none focus:ring-2 ring-blue-800 caret-current"
      )}
      ref={inputRef}
      placeholder="Rue ou station de métro"
      value={search}
      // @ts-ignore
      onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
      id="input"
      type="text"
      autoFocus
      onKeyDown={onKeyDown}
    ></input>
  );
};

export default Input;
