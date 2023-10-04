import { METRO_LINES, LINES } from "@/lib/constants";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

const MetroProgressBars = ({
  foundStationsPerLine,
  stationsPerLine,
}: {
  foundStationsPerLine: Record<string, number>;
  stationsPerLine: Record<string, number>;
}) => {
  return (
    <div className="@container grid grid-cols-[repeat(8,min-content)] grid-rows-2 gap-2">
      {METRO_LINES.map((line) => {
        return (
          <div
            key={line}
            className="relative h-6 w-6 @md:h-8 @md:w-8 flex items-center justify-center"
          >
            <div className="absolute w-full h-full z-10">
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
            <span
              className="block text-sm @md:text-base font-bold z-20"
              style={{ color: LINES[line].textColor }}
            >
              {LINES[line].name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default MetroProgressBars;
