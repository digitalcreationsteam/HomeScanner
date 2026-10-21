const paths = {
    cube: "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5",
    file: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
    drop: "M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z",
    wrench: "M21 7.5a5 5 0 01-6.8 4.7L7 19.4a2 2 0 01-2.8-2.8l7.2-7.2A5 5 0 0116.5 3l-3 3 .5 3 3 .5 3-3z",
    shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4",
    clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
    pin: "M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z",
    home: "M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6",
    crane: "M4 21h16M7 21V8M7 8h13M7 4l13 4M17 8v5",
    phone: "M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zM11 18h2",
    bell: "M6 16v-5a6 6 0 1112 0v5l2 2H4l2-2zM10 21h4",
    coin: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v10M9.5 10h4a1.5 1.5 0 010 3h-3.5a1.5 1.5 0 000 3H14",
    qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM20 14v6h-3M14 20h3",
    check: "M5 12.5l4.5 4.5L19 7.5",
    arrow: "M5 12h14M13 6l6 6-6 6",
  };
  
  export default function Icon({ name, className = "h-5 w-5" }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d={paths[name]} />
      </svg>
    );
  }