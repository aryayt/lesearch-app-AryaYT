"use client";

import type { PlateLeafProps } from "@udecode/plate/react";
import { PlateLeaf } from "@udecode/plate/react";
import * as React from "react";

export function HighlightLeaf(props: PlateLeafProps) {
	return (
		<PlateLeaf {...props} as="mark" className="bg-highlight/30 text-inherit">
			{props.children}
		</PlateLeaf>
	);
}
