const StreetIcon = ({ className }: { className: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="19"
        y="69"
        width="142"
        height="79"
        fill="#1E3A8A"
        stroke="#648D40"
        stroke-width="20"
      />
      <path
        d="M39 53.6842V66H142V53.6842C130 53.6842 129 27.0001 90.5 27C52 26.9999 51 53.6842 39 53.6842Z"
        fill="#1E3A8A"
        stroke="#648D40"
        stroke-width="15"
      />
      <circle cx="29.5" cy="78.5" r="12.5" fill="#86AA65" />
      <circle cx="90" cy="30" r="8" fill="#86AA65" />
      <circle cx="151.5" cy="78.5" r="12.5" fill="#86AA65" />
      <circle cx="151.5" cy="135.5" r="12.5" fill="#86AA65" />
      <circle cx="29.5" cy="135.5" r="12.5" fill="#86AA65" />
    </svg>
  );
};

export default StreetIcon;
