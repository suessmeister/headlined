"use client";

import { useEffect } from "react";

export function SocketInit() {
   useEffect(() => {
      fetch("/api/socket");
   }, []);

   return null;
}
