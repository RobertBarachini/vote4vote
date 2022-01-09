import { Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useState } from "react";
import { InputField } from "src/components/InputField";
import { NavBar } from "src/components/NavBar";
import { Wrapper } from "src/components/Wrapper";
import { useCreatePostMutation } from "src/generated/graphql";
import { Image } from "@chakra-ui/react";

const CreatePost = () => {
	const [ , createPost ] = useCreatePostMutation();
	// set up hook for numberOfTeams variable
	let [ numberOfTeams, setNumberOfTeams ] = useState(2);		
	const teams: any = [];
	return (
		<>
			<NavBar />
			<h1
				style={{
					textAlign: "center",
					marginTop: "2rem",
					fontWeight: "bold",
					fontSize: "2rem",
				}}
			>
				Create Post
			</h1>
			<Wrapper variant='medium'>
				<Formik
					initialValues={{
						title: "New Post",
						playingFieldSize: 200,
						teamsArg: new Array(numberOfTeams).fill({ imageUrl: "" }),
					}} 
					onSubmit={async (values, { setErrors }) => {
						console.log('values', values);
						const teamsArgSafe:string = JSON.stringify(values.teamsArg);
						console.log('teamsArgSafe', teamsArgSafe);
						const res = await createPost({
							title: values.title,
							playingFieldSize: parseInt(values.playingFieldSize.toString()),
							teamsArg: teamsArgSafe,
						});
						// if (res.data?.register?.errors) {
						// 	setErrors(toErrorMap(res.data.register.errors));
						// } else if (res.data?.register?.user) {
						// 	router.push("/"); // redirect to home page
						// }
						console.log('res:', res.data?.createPost);
						// return res;
					}}
				>
					{({ values, handleChange, isSubmitting }) => (
						<Form>
							<InputField name='title' placeholder='Title' label='Title' />
							<InputField name='playingFieldSize' placeholder='200' label='Playing field size' />
							{
								Array.from(Array(numberOfTeams).keys()).map((team, index) => {
									teams.push({
										imageUrl: "hmm",
									})
									return (
										<div key={index}>
											<h3
												style={{
													textAlign: "center",
													marginTop: "2rem",
													fontWeight: "bold",
													fontSize: "1.5rem",
												}}
											>
												Team {index + 1}
											</h3>
											<InputField name={`teamsArg.${index}.title`} placeholder='Team title' label='Team title' />
											<InputField name={`teamsArg.${index}.imageUrl`} placeholder='Team image url' label='Team image url' />
											<Image
												src={values?.teamsArg[index]?.imageUrl}
												alt={'Placeholder' + (index + 1)}
												// boxSize="10rem"
												// borderRadius={'0.5rem'}
												fallbackSrc={'https://via.placeholder.com/300'}
												style={{
													maxHeight: '10rem',
													borderRadius: '0.5rem',
													marginTop: '0.5rem',
													marginBottom: '0.5rem',
												}}
											/>
											<InputField name={`teamsArg.${index}.color`} placeholder='Team color' label='Team color' />
										</div>
									);
								})
							}
							{ numberOfTeams < 8 
								&& <Button mt={4} mr={4} backgroundColor='teal' onClick={() => {if(numberOfTeams < 8) {setNumberOfTeams(numberOfTeams += 1)}}}>New team</Button>}
							{ numberOfTeams > 2
								&& <Button mt={4} mr={4} backgroundColor='teal' onClick={() => {if(numberOfTeams > 2) {setNumberOfTeams(numberOfTeams -= 1)}}}>Remove last team</Button>}
							<Button mt={4} isLoading={isSubmitting} type='submit' backgroundColor='teal'>Create</Button>
						</Form>
					)}
				</Formik>
			</Wrapper>
		</>
	);
};

export default CreatePost
