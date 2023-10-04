import { SVGProps } from "react";

export function MaximizeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M16.143 1.25a.75.75 0 1 0 0 1.5h4.046l-5.72 5.72a.75.75 0 0 0 1.061 1.06l5.72-5.72v4.047a.75.75 0 0 0 1.5 0V2a.75.75 0 0 0-.75-.75h-5.857Zm-8.286 21.5a.75.75 0 0 0 0-1.5H3.811l5.72-5.72a.75.75 0 1 0-1.061-1.06l-5.72 5.72v-4.047a.75.75 0 1 0-1.5 0V22c0 .414.336.75.75.75h5.857Z"
      ></path>
    </svg>
  );
}
