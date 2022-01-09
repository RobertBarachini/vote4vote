import { Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "src/components/InputField";
import { NavBar } from "src/components/NavBar";
import { toErrorMap } from "src/utils/toErrorMap";
import { Wrapper } from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";

interface ILoginProps {

}

export const Login: React.FC<ILoginProps> = ({}) => {
	const [ , login ] = useLoginMutation();
	const router = useRouter();
	return (
		<>
			<NavBar/>
			<Wrapper variant='small'>
				<Formik
					initialValues={{
						username: '',
						password: ''
					}} 
					onSubmit={async (values, { setErrors }) => {
						const res = await login({ options: values });
						if (res.data?.login?.errors) {
							setErrors(toErrorMap(res.data.login.errors));
						} else if (res.data?.login?.user) {
							router.push("/");
						}
					}}
				>
					{({ values, handleChange, isSubmitting }) => (
						<Form>
							<InputField name='username' placeholder='Username' label='Username' />
							{/* <InputField name='email' placeholder='Email' label='Email' /> */}
							<InputField name='password' placeholder='Password' label='Password' type='password' />
							<Button mt={4} isLoading={isSubmitting} type='submit' backgroundColor='teal'>Login</Button>
						</Form>
					)}
				</Formik>
			</Wrapper>
		</>
	);
};

export default Login;
