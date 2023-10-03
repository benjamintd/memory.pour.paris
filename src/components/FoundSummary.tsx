import { METRO, METRO_LINES } from "@/lib/constants";
import { usePrevious } from "@react-hookz/web";
import classNames from "classnames";
import { range } from "lodash";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

const FoundSummary = ({
  className,
  foundStreetsPercentage,
  foundStationsPercentage,
  foundStationsPerLine,
  stationsPerLine,
}: {
  className?: string;
  foundStreetsPercentage?: number;
  foundStationsPercentage: number;
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
              src: `/images/${METRO[line].name}.png`,
              width: 64,
              height: 64,
            })),
          },
        });
      };

      makeConfetti();
    }
  }, [previousFound, foundStationsPerLine, stationsPerLine]);

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
      <p className="mb-2">
        <span className="text-lg @md:text-2xl font-bold">
          {(foundStationsPercentage * 100).toFixed(1)}
        </span>{" "}
        <span className="text-lg @md:text-xl">%</span>{" "}
        <br className="hidden @md:block" />{" "}
        <span className="text-sm">des stations de métro trouvées</span>
      </p>
      <div className="grid grid-cols-[repeat(8,minmax(0,1fr))] grid-rows-2 gap-1">
        {METRO_LINES.map((line) => {
          return (
            <div
              key={line}
              className="relative h-8 @md:h-10 aspect-square flex items-center justify-center"
            >
              <div className="absolute w-full h-full z-10">
                <CircularProgressbar
                  background
                  backgroundPadding={2}
                  styles={buildStyles({
                    backgroundColor: METRO[line].color,
                    pathColor: METRO[line].textColor,
                    trailColor: "transparent",
                  })}
                  value={
                    (100 * (foundStationsPerLine[line] || 0)) /
                    stationsPerLine[line]
                  }
                />
              </div>
              <span
                className="block text-base @md:text-lg font-bold z-20"
                style={{ color: METRO[line].textColor }}
              >
                {METRO[line].name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FoundSummary;
