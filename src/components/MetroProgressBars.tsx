import { METRO_LINES, LINES } from "@/lib/constants";
import { Popover } from "@headlessui/react";
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
          <Popover
            as="div"
            key={line}
            className="relative h-6 w-6 @md:h-8 @md:w-8 flex items-center justify-center"
          >
            <Popover.Button className="absolute w-full h-full z-10">
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
            </Popover.Button>
            <span
              className="block text-sm @md:text-base font-bold z-20"
              style={{ color: LINES[line].textColor }}
            >
              {LINES[line].name}
            </span>
            <Popover.Panel className="absolute z-10">
              <div className="grid grid-cols-2">
                <a href="/analytics">Analytics</a>
                <a href="/engagement">Engagement</a>
                <a href="/security">Security</a>
                <a href="/integrations">Integrations</a>
              </div>

              <img src="/solutions.jpg" alt="" />
            </Popover.Panel>
          </Popover>
        );
      })}
    </div>
  );
};

export default MetroProgressBars;
