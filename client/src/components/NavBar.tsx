import { Box, Link, Flex, Button } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "src/generated/graphql";

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery();
	console.log("Data:", data);
	let body = null;
	if (fetching) { // data loading
		body = null;
		console.log("Fetching...");
	} else if (!data?.me) { // not logged in
		console.log("Not logged in");
		body = (
			<>
				<NextLink href="/login">
					<Link mr={4}>
						Login
					</Link>
				</NextLink>
				<NextLink href="/register">
					<Link mr={4}>
						Register
					</Link>
				</NextLink>
			</>
		);
	} else { // logged in
		console.log("Logged in");
		body = (
			<>
				<Flex>
					<Box
						mr={4}
					>
						{data.me.username}
					</Box>
					<Button 
						onClick={() => logout()}
						isLoading={logoutFetching}
						mr={4}
						variant='link'
					>
						Logout
					</Button>
				</Flex>
			</>
		);
	}

	return (
		<Flex 
			bg="teal.500"
			p={5}
		>
			<NextLink href="/">
				<Link color="white" fontSize="lg" mr={6}>
					Home
				</Link>
			</NextLink>
			<NextLink href="/post/create">
				<Link color="white" fontSize="lg">
					New post
				</Link>
			</NextLink>
			<Box
				ml={'auto'}
			>
				{body}
			</Box>
		</Flex>
	);
};
