import { Flex, Link, Image, Button } from "@chakra-ui/react";
import { NavBar } from "src/components/NavBar";
import { Wrapper } from "src/components/Wrapper";
import { Post, useDeletePostMutation, useMeQuery, usePostsQuery } from "src/generated/graphql";
import NextLink from "next/link";
import { Router, useRouter } from "next/router";

const Index = () => {
	// Fetch Posts from server using usePostsQuery
	let [ postsq, ] = usePostsQuery();
	const [{ data, fetching }] = useMeQuery();
	let [ , deletePost ] = useDeletePostMutation();
	const router = useRouter();
	console.log("DataMe:", data);
	let posts = null;
	if (postsq?.data?.posts) {
		posts = postsq.data.posts;
		console.log('posts', posts);
	}

	return (
		<>
			<NavBar />
			<div
				style={{
					padding: '1rem',
				}}
			>
				<Wrapper variant='large'>
					<h1
						style={{
							textAlign: 'center',
							fontWeight: 'bold',
							fontSize: '2rem',
						}}
					>
						Posts
					</h1>
					{
						posts?.map((post: any) => {
							console.log("POST:" + post.authorId + " " + data?.me?._id);
							return (
								<Flex
									direction={'column'}
									bg='#517d7c'
									// Drop shadow
									style={{
										padding: '1rem',
										marginBottom: '1rem',
										marginTop: '1rem',
										borderRadius: '0.5rem',
										boxShadow: '10px 10px 10px rgba(0,0,0,0.3)',
									}}
								>
									<NextLink href={`/post/${post._id}`}>
										<Link mr={4}>
											<h1
												style={{
													fontSize: '1.5rem',
													fontWeight: 'bold',
													paddingLeft: '1rem',
												}}
											>
												{post.title}
											</h1>
										</Link>
									</NextLink>
									<Flex
										key={'post_' + post._id}
										style={{
											padding: '1rem',
										}}
									>
										{/* Image from post.imageUrl */}
										<Image
											src={post.teams[Math.floor(Math.random() * post.teams.length)].imageUrl}
											alt={post.title}
											// boxSize="10rem"
											// borderRadius={'0.5rem'}
											fallbackSrc={'https://via.placeholder.com/300'}
											style={{
												maxHeight: '10rem',
												borderRadius: '0.5rem',
											}}
										/>
										<Flex
											direction="row"
											justify="left"
											padding="1rem"
											style={{
												padding: '0rem',
												display: 'inline-block',
												// border: '1px solid black',
												marginLeft: '1rem',
											}}
										>
											{/* Post body consists of post.teams titles with colored round divs between them taken from post.teams color */}
											{post.teams.map((team: any) => {
												console.log(team.title);
												return (
													<div
														style={{
															placeItems: 'center',
															// border: '1px solid white',
															display: 'inline-block',
															margin: '0.5rem',
														}}
													>
														<div
															key={'team_' + team._id}
															style={{
																backgroundColor: team.color,
																width: '1em',
																height: '1em',
																borderRadius: '50%',
																display: 'inline-block',
															}}
														>
														</div>
														<div
															style={{
																display: 'inline-block',
																padding: '0.5rem',
															}}
														>
															{team.title}
														</div>
													</div>
												);
											})}
										</Flex>
									</Flex>
									<Flex
										justify={'right'}
									>
										{/* Button which is displayed only if post.authorId matches dataMe?.me._id (TODO or if the logged in user role is appropriate) */}
										{
											post.authorId === data?.me?._id &&
											<Button
												variant='outline'
												style={{
													marginLeft: '1rem',
												}}
												onClick={async () => {
													// Delete post
													console.log("lmfaoi");
													const res = await deletePost({ id: post._id });
													console.log("Removing of post " + post._id + " :" + res);
													if (res) {
														// TODO actually do this via router/hooks to update posts
														window.location.reload();
														// router.push('/');
													}
												}}
											>
												Delete post
											</Button>
										}
									</Flex>
								</Flex>
							)
						})
					}
				</Wrapper>
			</div>
		</>
	);
};

export default Index
