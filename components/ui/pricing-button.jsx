"use client";

import { Button } from "@/components/ui/button";
import { scroller } from "react-scroll";

export default function PricingButton() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        scroller.scrollTo("pricing", {
          smooth: true,
          duration: 700,
          offset: -1,
        })
      }
    >
      See Pricing
    </Button>
  );
}