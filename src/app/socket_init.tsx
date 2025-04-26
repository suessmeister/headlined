// we'll use this file for local dev and NOT production

"use client";

import { useEffect } from "react";

export function SocketInit() {
   useEffect(() => {
      fetch("/api/socket");
   }, []);

   return null;
}
