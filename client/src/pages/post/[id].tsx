import { Flex, Select, Image, Switch } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from 'react';
import { Post, useMeQuery, usePostQuery, useUpdatePlayingFieldMutation } from "src/generated/graphql";
import http from 'http';
import { NavBar } from "src/components/NavBar";

interface PostTeam {
	title: string;
	imageUrl: string;
	color: string;
	score: number;
}

let playingFieldSize = 0;
// let selectedColorIndex: number = 0;
let elementsClicked: Array<object> = [];
// used for sending the clicked elements to the server
const intervalSend = 1000; // ms
// used for fetching the current state of the playing field from the server
const intervalFetch = 500; // ms

const emptyColor = "#F4F6F4";

let emulatePlayers = false; // false

let teams: Array<PostTeam> = [];

const getColor = (teamIndex: string): string => {
	if (teamIndex === ' ') {
		return emptyColor;
	}
	return teams[parseInt(teamIndex)].color;
}

interface PlayingFieldProps {
	post: Post;
}

interface PlayingFieldState {
	playingField: Array<string>;
	teams: Array<PostTeam>;
	selectedColorIndex: number;
	elementsClicked: Array<object>;
	intervalSend: number;
	intervalFetch: number;
	randomValue: Array<number>;
}

class PlayingField extends React.Component<any> {
	state: PlayingFieldState = {
		playingField: [],
		teams: [],
		selectedColorIndex: 0,
		elementsClicked: [],
		intervalSend: intervalSend,
		intervalFetch: intervalFetch,
		randomValue: [-1, -1]
	}

	props:any;

	timerFetch: any;

	constructor(props: PlayingFieldProps) {
		super(props);
		const { post } = props;
		this.props = props;
		console.log('this.props:', this.props);
		const playingField = post.playingFieldText.split(''); //.map(char => parseInt(char));
		// teams = post.teams;
		// teams = {...teams, ...post.teams};
		teams = post.teams.map(team => {
			return {
				title: team.title,
				imageUrl: team.imageUrl,
				color: team.color,
				score: 0,
			}
		});
		console.log('teams:', teams);
		// console.log('Playing field:', playingField);
		this.state = {
			playingField,
			teams,
			selectedColorIndex: 0, //Math.floor(Math.random() * 2),
			elementsClicked: Array<object>(),
			intervalSend: intervalSend,
			intervalFetch: intervalFetch,
			randomValue: [-2, -2]
		};
		console.log('selectedColorIndex:', this.state.selectedColorIndex);
	}

	processClick = (elementIndex: number) => {
		const playingField = this.state.playingField;
		playingField[elementIndex] = this.state.selectedColorIndex.toString();
		this.setState({
			playingField,
		});
		elementsClicked.push({
			index: elementIndex,
			color: this.state.selectedColorIndex.toString(),
		});
	}

	handleTick = () => {
		if (emulatePlayers) {
			// Randomly simulate other players clicking
			const randomColor = Math.floor(Math.random() * this.state.teams.length);
			const randomCell = Math.floor(Math.random() * this.state.playingField.length);
			const randomDo = Math.floor(Math.random() * 100);
			if (randomDo < 10) {
				elementsClicked.push({
					index: randomCell,
					color: randomColor,
				});
			}
		}

		const id = this.props.post._id;

		let request = `
			mutation{
				updatePlayingField(
					options: {
						id: "${id}",
						elementsClicked: "${(JSON.stringify(elementsClicked)).replace(/"/g, '\\"')}"
					}
					) {
					_id,
					title,
					updatedAt,
					playingFieldText
				}
			}`;

		request = JSON.stringify({query: request});

		const options = {
			hostname: process.env.HOSTNAME,
			path: '/graphql',
			port: '4000',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				// 'Content-Length': request.length,
				// 'User-Agent': 'Node',
				// 'Accept-Encoding': 'gzip, gzip, deflate, br',
			},
			body: request
		};

		// console.log('clickedElements: ', elementsClicked.length);

		// https://stepzen.com/blog/consume-graphql-in-javascript
		const req = http.request(options, (res) => {
			let data = '';
			// console.log(`statusCode: ${res.statusCode}`);
			if (res.statusCode === 200) {
				elementsClicked = [];
			}

			res.on('data', (d) => {
				data += d;
			});
			res.on('end', () => {
				if (res.statusCode === 200) {
					try {
						const resPost: Post = JSON.parse(data).data.updatePlayingField;
						// let playingField = this.state.playingField;
						const playingFieldNew = resPost.playingFieldText.split('');
						// for each of elementsClicked, update the playingField
						elementsClicked.forEach((elementClicked: any) => {
							console.log("Element clicked: ", elementClicked);
							playingFieldNew[elementClicked.index] = elementClicked.color;
						});
						this.setState({
							playingField: playingFieldNew,
						});
					} catch (e) {
						console.log('error:', e);
					}
					// console.log(JSON.parse(data).data);
				}
			});
		});

		req.on('error', (error) => {
			console.error(error);
		});

		req.write(request);
		req.end();
	}

	handleTeamChange(index: number) {
		let { selectedColorIndex } = this.state;
		selectedColorIndex = index;
		this.setState({
			selectedColorIndex
		});
	}

	componentDidMount() {
		this.timerFetch = setInterval(() => this.handleTick(), this.state.intervalFetch);
	}
	componentWillUnmount() {
		clearInterval(this.timerFetch);
	}

	public render() {
		const { playingField, teams, elementsClicked } = this.state;
		let { selectedColorIndex } = this.state;

		// set scores
		let cellsCount = 0;
		let cellsEmptyCount = 0;
		const scores = {} as any;
		playingField.map((element, index) => {
			cellsCount += 1;
			const teamIndexSafe = parseInt(element);
			if (!isNaN(teamIndexSafe)) {
				if (!scores[teamIndexSafe]) {
					scores[teamIndexSafe] = 1;
				} else {
					scores[teamIndexSafe]++;
				}
			} else {
				cellsEmptyCount += 1;
			}
		});

		const sortedScores = Object.keys(scores).map(key => ({ teamIndex: key, score: scores[key] }));
		sortedScores.sort((a, b) => b.score - a.score);
		// console.log('sortedScores:', sortedScores);
		
		return (
			<>
				<Flex
					direction="row"
					justify="center"
					align="center"
					wrap="wrap"
					height="100%"
					width="100%"
				>
					<Flex
						direction="row"
						justify="left"
						align="center"
						wrap="wrap"
						height="100%"
						width="100%"
						maxW={800}
					>					
						<Select
							bg={getColor(selectedColorIndex.toString())}
							borderColor={getColor(selectedColorIndex.toString())}
							color='white'
							// placeholder={teams[0].title}
							onChange={(e: any) => this.handleTeamChange(e.target.options.selectedIndex)}//(this.state.selectedColorIndex = e.target.options.selectedIndex)}//this.handleChange(e.target.value)}
							style={{
								fontWeight: 'bold',
							}}
						>
							{
								teams.map((team, index) => {
									return (
										<option 
											key={'selectTeam_' + index.toString()}
											value={team.title}
											style={{
												backgroundColor: getColor(index.toString()),
												fontWeight: 'bold',
											}}
										>
											{team.title}
										</option>
									);
								})
							}
						</Select>
						{/* Spacer between elements */}
						<div style={{ width: '100%', height: '2rem' }}></div>
						{
							playingField.map((element, index) => {
								playingFieldSize += 1;
								const teamIndexSafe = parseInt(element);
								// console.log('Team index safe:', teamIndexSafe);
								if (!isNaN(teamIndexSafe)) {
									teams[teamIndexSafe].score += 1;
								}
								// console.log('playingFieldSize:', playingFieldSize);
								return (
									<div 
										onClick={() => this.processClick(index)}
										// onMouseUp={() => this.processClick(index)}
										onMouseUpCapture={() => this.processClick(index)}
										key= {'block_' + index.toString()}
										id={'block_' + index.toString()}
										style={{
											width: '2rem',
											height: '2rem',
											backgroundColor: getColor(element),
											// display: 'inline-block',
											userSelect: 'none',
											MozWindowDragging: 'no-drag',
											cursor: 'pointer',
											// borderRadius: '25%', // 50%
											// margin: '0.136rem', //0.25rem',
											display: 'grid',
											placeItems: 'center',
											overflow: 'hidden',
										}}
									>
										{/* {index+1} */}
									</div>
								);
							})
						}
						<div style={{ width: '100%', height: '2rem' }}></div>
						{
							sortedScores.map((team, index) => {
								return (
									<div 
										key= {'team_' + index.toString()}
										id={'team_' + index.toString()}
										style={{
											width: (team.score / cellsCount * 100) + '%',
											height: '2rem',
											backgroundColor: getColor(team.teamIndex),
											display: 'grid',
											placeItems: 'center',
											fontWeight: 'bold',
											fontSize: '1.1rem',
											overflow: 'hidden',
										}}
									>
										{team.score}
									</div>
								);
							})
						}
						<div 
							key= {'team_ '}
							id={'team_ '}
							style={{
								width: (cellsEmptyCount / cellsCount * 100) + '%',
								height: '2rem',
								backgroundColor: getColor(' '),
								display: 'grid',
								placeItems: 'center',
								fontWeight: 'bold',
								fontSize: '1.1rem',
								overflow: 'hidden',
								color: 'black'
							}}
						>
							{cellsEmptyCount}
						</div>
					</Flex>
				</Flex>
				{/* <div>Random value: {this.state.randomValue.toString()}</div> */}
			</>
		);
	}
}

const Post = ({}) => {
	const router = useRouter()
  const id = router.query.id as string;
	console.log('id Post:', id);
	// console.log('Router query:', router.query);
	// Fetch the Post by id from the server
	const [{data, fetching}] = usePostQuery({
		variables: {
			id: id
		}
	});
	// console.log('Data:', data);
	const post = data?.post;
	// console.log('Post:', post);

	const [{ data: me, fetching: fetching2 }] = useMeQuery();
	console.log("Me:", me);	

	if (!post) {
		return (
			<>
				<NavBar/>
				<h1
					style={{
						textAlign: 'center',
						marginTop: '2rem',
						fontWeight: 'bold',
						fontSize: '2rem',
					}}
				>
					Post not found
				</h1>
			</>
		);
	}
	return (
		<>
			<NavBar/>
			<div
				style={{
					padding: '1rem',
				}}
			>
				<h1
					style={{
						fontSize: '2rem',
						fontWeight: 'bold',
						padding: '1rem',
						// marginTop: '2rem',
						display: 'grid',
						placeItems: 'center',
					}}
				>
					{post.title}
				</h1>
				{/* Pass post as props to PlayingField */}
				<PlayingField post={post}/>
				{/* <p>{id}</p> */}
				{/* <p>Playing field text: {post.playingFieldText}</p> */}
				{/* <br></br> */}
				{/* Toggle switch for emulatePlayers */}
				<Flex
					style={{
						display: 'grid',
						placeItems: 'center',
					}}
				>
					<Switch
					style={
						{
							marginTop: '2rem',
							display: 'flex',
							placeItems: 'center',
						}		
					}
						size={'lg'}
						defaultChecked={emulatePlayers}
						onChange={(onChangeEv) => {
							emulatePlayers = onChangeEv.target.checked;
						}}
						spacing={'1rem'}
					>
						{/* {emulatePlayers ? 'Disable autoclicker' : 'Enable autoclicker'} */}
						<p
							style={{
								fontSize: '1.2rem',
								fontWeight: 'bold',
							}}
						>
							Toggle autoclicker
						</p>
					</Switch>
				</Flex>
				<h1
					style={{
						fontSize: '2rem',
						fontWeight: 'bold',
						paddingTop: '1rem',
						marginTop: '2rem',
						display: 'grid',
						placeItems: 'center',
					}}
				>
					Teams:
				</h1>
				<Flex
					direction="row"
					justify="center"
					align="center"
					wrap="wrap"
					height="100%"
					width="100%"
					
					justifyContent="space-around"
					alignItems="center"
					style={{
						padding: '1rem',
						marginBottom: '2rem',
					}}
				>
					{
						post.teams.map((team, index) => {
							const numTeams = post.teams.length;
							return (
								<>
									<div 
										key={'team_' + index.toString()}
										style={{
											padding: '2rem',
											border: '0.25rem solid',
											borderRadius: '0.5rem',
											// // backgroundColor: team.color,
											borderColor: team.color,
											margin: '2rem',
										}}
									>
										{/* <div>Team {index+1}: {team.title}</div> */}
										<Image 
											src={team.imageUrl}
											alt={team.title} 
											style={{
												maxHeight: '20rem',
												// border: '0.5rem solid',
												// borderRadius: '0.5rem',
												// backgroundColor: team.color,
												// borderColor: team.color,
											}}
										/>
										<div 
											style={{
												width: '100%',
												height: '2rem',
												backgroundColor: team.color,
												marginTop: '2rem',
												borderRadius: '1rem',
												fontWeight: 'bold',
												placeItems: 'center',
												display: 'grid',
											}}
										>
											Team {index+1}: {team.title}
										</div>
									</div>
									{/* {index < numTeams - 1 && <div style={{fontWeight: 'bold', padding: '0.5rem', display: 'inline'}}>vs</div>} */}
								</>
							);
						})
					}
				</Flex>
			</div>
		</>
	)
};

export default Post;
