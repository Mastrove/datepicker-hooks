import React from "react";

export default function NavButton({ children, callback }: any) {
  return (
    <button type="button" onClick={callback}>
      {children}
    </button>
  );
}
