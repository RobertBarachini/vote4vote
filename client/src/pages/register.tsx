// import { FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "src/components/InputField";
import { toErrorMap } from "src/utils/toErrorMap";
// import { useMutation } from "urql";
import { Wrapper } from "../components/Wrapper";
import { useRegisterMutation } from "../generated/graphql";

interface IRegisterProps {

}

export const Register: React.FC<IRegisterProps> = ({}) => {
	const [ , register ] = useRegisterMutation();
	const router = useRouter();
	return (
		<Wrapper variant='small'>
			<Formik
				initialValues={{
					username: '',
					email: '',
					password: ''
				}} 
				onSubmit={async (values, { setErrors }) => {
					const res = await register(values);
					if (res.data?.register?.errors) {
						setErrors(toErrorMap(res.data.register.errors));
					} else if (res.data?.register?.user) {
						router.push("/"); // redirect to home page
					}
					// return res;
				}}
			>
				{({ values, handleChange, isSubmitting }) => (
					<Form>
						<InputField name='username' placeholder='Username' label='Username' />
						<InputField name='email' placeholder='Email' label='Email' />
						<InputField name='password' placeholder='Password' label='Password' type='password' />
						<Button mt={4} isLoading={isSubmitting} type='submit' backgroundColor='teal'>Register</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default Register;
