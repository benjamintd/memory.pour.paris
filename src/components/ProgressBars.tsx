import { LINES } from "@/lib/constants";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import Image from "next/image";

const ProgressBars = ({
  mode,
  foundStationsPerLine,
  stationsPerLine,
}: {
  mode: string;
  foundStationsPerLine: Record<string, number>;
  stationsPerLine: Record<string, number>;
}) => {
  return (
    <div className="@container grid grid-cols-[repeat(8,min-content)] gap-2">
      {Object.keys(LINES)
        .filter((l) => LINES[l].mode === mode)
        .map((line) => {
          return (
            <div
              key={line}
              className="relative h-6 w-6 @md:h-8 @md:w-8 flex items-center justify-center"
            >
              <div className="absolute w-full h-full">
                <CircularProgressbar
                  background
                  backgroundPadding={2}
                  styles={buildStyles({
                    backgroundColor: LINES[line].color,
                    pathColor: LINES[line].textColor,
                    trailColor: "transparent",
                  })}
                  value={
                    (100 * (foundStationsPerLine[line] || 0)) /
                    stationsPerLine[line]
                  }
                />
              </div>
              <Image
                alt={line}
                src={`/images/${LINES[line]?.name}.png`}
                width={64}
                height={64}
                className="h-4 w-4 @md:h-6 @md:w-6 rounded-full overflow-hidden z-20"
              />
            </div>
          );
        })}
    </div>
  );
};

export default ProgressBars;
