"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import React from "react";

const Logo = () => {
	const { resolvedTheme } = useTheme();
	return (
		<Image
			src={
				resolvedTheme === "dark"
					? "/logo/Lesearch Logo Dark.svg"
					: "/logo/Lesearch Logo.svg"
			}
			alt="Logo"
			width={32}
			height={32}
		/>
	);
};

export default Logo;
