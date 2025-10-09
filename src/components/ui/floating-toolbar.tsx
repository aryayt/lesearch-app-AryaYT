"use client";

import { useComposedRef } from "@udecode/cn";
import {
	useEditorId,
	useEventEditorValue,
	usePluginOption,
} from "@udecode/plate/react";
import {
	type FloatingToolbarState,
	flip,
	offset,
	useFloatingToolbar,
	useFloatingToolbarState,
} from "@udecode/plate-floating";
import type * as React from "react";

import { cn } from "@/lib/utils";

import { Toolbar } from "./toolbar";

type FloatingToolbarProps = React.ComponentProps<typeof Toolbar> & {
	state?: FloatingToolbarState;
};

export function FloatingToolbar({
	children,
	className,
	state,
	...props
}: FloatingToolbarProps) {
	const editorId = useEditorId();
	const focusedEditorId = useEventEditorValue("focus");
	const isFloatingLinkOpen = !!usePluginOption({ key: "a" }, "mode");
	const isAIChatOpen = usePluginOption({ key: "aiChat" }, "open");

	const floatingToolbarState = useFloatingToolbarState({
		editorId,
		focusedEditorId,
		hideToolbar: isFloatingLinkOpen || isAIChatOpen,
		...state,
		floatingOptions: {
			middleware: [
				offset(12),
				flip({
					fallbackPlacements: [
						"top-start",
						"top-end",
						"bottom-start",
						"bottom-end",
					],
					padding: 12,
				}),
			],
			placement: "top",
			...state?.floatingOptions,
		},
	});

	const {
		clickOutsideRef,
		hidden,
		props: rootProps,
		ref: floatingRef,
	} = useFloatingToolbar(floatingToolbarState);

	const ref = useComposedRef<HTMLDivElement>(
		props.ref as React.Ref<HTMLDivElement>,
		floatingRef,
	);

	if (hidden) return null;

	return (
		<div ref={clickOutsideRef} className="fixed z-50">
			<Toolbar
				{...props}
				{...rootProps}
				ref={ref}
				className={cn(
					"absolute z-[9999] scrollbar-hide overflow-x-auto rounded-md border bg-popover p-1 whitespace-nowrap opacity-100 shadow-md print:hidden",
					"max-w-[80vw]",
					className,
				)}
			>
				{children}
			</Toolbar>
		</div>
	);
}
