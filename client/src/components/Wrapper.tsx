import { Box } from "@chakra-ui/react";
import React from "react";

interface IWrapperProps {
	variant?: "small" | "medium" | "large";
}

export const Wrapper: React.FC<IWrapperProps> = ({ children, variant='medium' }) => {
	return (
		<Box 
			mt={8}
			mx="auto"
			maxW={variant === 'medium' ? "800px" : variant === 'large' ? "1200px" : "400px"}
			w="100%"
		>
			{children}
		</Box>
	);
};
