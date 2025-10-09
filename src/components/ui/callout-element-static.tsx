import { cn } from "@udecode/cn";

import type { SlateElementProps, TElement } from "@udecode/plate";
import { SlateElement } from "@udecode/plate";
import * as React from "react";

interface CalloutElementProps extends SlateElementProps {
	element: TElement & {
		backgroundColor?: string;
		icon?: string;
	};
}

export function CalloutElementStatic({
	children,
	className,
	...props
}: CalloutElementProps) {
	return (
		<SlateElement
			className={cn("my-1 flex rounded-sm bg-muted p-4 pl-3", className)}
			style={{
				backgroundColor: props.element.backgroundColor,
			}}
			{...props}
		>
			<div className="flex w-full gap-2 rounded-md">
				<div
					className="size-6 text-[18px] select-none"
					style={{
						fontFamily:
							'"Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols',
					}}
				>
					<span data-plate-prevent-deserialization>
						{props.element.icon || "💡"}
					</span>
				</div>
				<div className="w-full">{children}</div>
			</div>
		</SlateElement>
	);
}
