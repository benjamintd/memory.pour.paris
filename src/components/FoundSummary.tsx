import { LINES, MODE_NAMES } from "@/lib/constants";
import getMode from "@/lib/getMode";
import { usePrevious } from "@react-hookz/web";
import classNames from "classnames";
import { range } from "lodash";
import { Fragment, useEffect, useMemo } from "react";
import MetroProgressBars from "./MetroProgressBars";

const FoundSummary = ({
  className,
  foundStreetsPercentage,
  foundStationsPerLine,
  stationsPerLine,
}: {
  className?: string;
  foundStreetsPercentage?: number;
  foundStationsPerLine: Record<string, number>;
  stationsPerLine: Record<string, number>;
}) => {
  const previousFound = usePrevious(foundStationsPerLine);

  useEffect(() => {
    // confetti when new line is 100%
    const newFoundLines = Object.keys(foundStationsPerLine).filter(
      (line) =>
        previousFound &&
        foundStationsPerLine[line] > previousFound[line] &&
        foundStationsPerLine[line] === stationsPerLine[line]
    );

    if (newFoundLines.length > 0) {
      const makeConfetti = async () => {
        const confetti = (await import("tsparticles-confetti")).confetti;
        confetti({
          spread: 120,
          ticks: 200,
          particleCount: 150,
          origin: { y: 0.2 },
          decay: 0.85,
          gravity: 2,
          startVelocity: 50,
          shapes: ["image"],
          scalar: 2,
          shapeOptions: {
            image: newFoundLines.map((line) => ({
              src: `/images/${LINES[line].name}.png`,
              width: 64,
              height: 64,
            })),
          },
        });
      };

      makeConfetti();
    }
  }, [previousFound, foundStationsPerLine, stationsPerLine]);

  const foundStationsPerMode = useMemo(() => {
    let foundStationsPercentagePerMode: Record<string, number> = {};
    for (let line of Object.keys(foundStationsPerLine)) {
      const mode = getMode(line);

      if (!foundStationsPercentagePerMode[mode]) {
        foundStationsPercentagePerMode[mode] = 0;
      }

      foundStationsPercentagePerMode[mode] += foundStationsPerLine[line];
    }

    const stationsPerMode = Object.keys(stationsPerLine).reduce((acc, line) => {
      const mode = getMode(line);

      if (!acc[mode]) {
        acc[mode] = 0;
      }

      acc[mode] += stationsPerLine[line];

      return acc;
    }, {} as Record<string, number>);

    // normalize
    for (let mode of Object.keys(foundStationsPercentagePerMode)) {
      foundStationsPercentagePerMode[mode] /= stationsPerMode[mode];
    }

    return foundStationsPercentagePerMode;
  }, [foundStationsPerLine, stationsPerLine]);

  return (
    <div className={classNames(className, "@container")}>
      {foundStreetsPercentage !== undefined && (
        <>
          {" "}
          <p className="mb-2">
            <span className="text-lg @md:text-2xl font-bold">
              {(foundStreetsPercentage * 100).toFixed(1)}
            </span>{" "}
            <span className="text-lg @md:text-xl">%</span>{" "}
            <br className="hidden @md:block" />{" "}
            <span className="text-sm">kilomètres de rues trouvés</span>
          </p>
          <div className="w-full grid grid-cols-[20] grid-rows-1 grid-flow-col gap-1 mb-4">
            {range(0, 20).map((i) => (
              <div
                key={i}
                className={classNames(
                  "h-4 @md:h-6 border-[1px] w-full col-span-1 shadow-sm",
                  {
                    "bg-blue-600 border-transparent":
                      i < foundStreetsPercentage * 20,
                    "bg-white border-blue-200":
                      i >= foundStreetsPercentage * 20,
                  }
                )}
              ></div>
            ))}
          </div>
        </>
      )}
      {["METRO", "RER", "TRAM", "TRAIN"].map((mode) => {
        if (!foundStationsPerMode[mode]) {
          return null;
        }

        return (
          <div key={mode} className="mb-2">
            <p className="mb-2">
              <span className="text-lg @md:text-2xl font-bold">
                {((foundStationsPerMode[mode] || 0) * 100).toFixed(1)}
              </span>{" "}
              <span className="text-lg @md:text-xl">%</span>{" "}
              <span className="text-sm">
                des stations de {MODE_NAMES[mode]} trouvées
              </span>
            </p>
            {mode === "METRO" && (
              <MetroProgressBars
                foundStationsPerLine={foundStationsPerLine}
                stationsPerLine={stationsPerLine}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FoundSummary;
