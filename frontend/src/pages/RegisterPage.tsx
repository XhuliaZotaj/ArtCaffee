import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Grid,
	Link,
	Paper,
	Avatar,
	CircularProgress,
} from "@mui/material";
import { PersonAddOutlined as PersonAddIcon } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
	username: Yup.string()
		.min(3, "Username must be at least 3 characters")
		.required("Username is required"),
	email: Yup.string()
		.email("Enter a valid email")
		.required("Email is required"),
	password: Yup.string()
		.min(6, "Password must be at least 6 characters")
		.required("Password is required"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref("password"), ""], "Passwords must match")
		.required("Confirm password is required"),
	firstName: Yup.string().max(50, "First name must be at most 50 characters"),
	lastName: Yup.string().max(50, "Last name must be at most 50 characters"),
});

const RegisterPage: React.FC = () => {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const formik = useFormik({
		initialValues: {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
			firstName: "",
			lastName: "",
		},
		validationSchema: validationSchema,
		onSubmit: async (values) => {
			setIsSubmitting(true);
			try {
				await register(
					values.username,
					values.email,
					values.password,
					values.firstName,
					values.lastName
				);
				toast.success("Registration successful!");
				navigate("/");
			} catch (error: any) {
				const errorMessage =
					error.response?.data?.error ||
					"Registration failed. Please try again.";
				toast.error(errorMessage);
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<Container component="main" maxWidth="sm">
			<Paper
				elevation={3}
				sx={{
					mt: 8,
					p: 4,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}>
				<Avatar sx={{ m: 1, bgcolor: "#b85c38" }}>
					<PersonAddIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Sign up
				</Typography>
				<Box
					component="form"
					onSubmit={formik.handleSubmit}
					noValidate
					sx={{ mt: 3, width: "100%" }}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<TextField
								required
								fullWidth
								id="firstName"
								label="First Name"
								name="firstName"
								autoComplete="given-name"
								value={formik.values.firstName}
								onChange={formik.handleChange}
								error={
									formik.touched.firstName && Boolean(formik.errors.firstName)
								}
								helperText={formik.touched.firstName && formik.errors.firstName}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								id="lastName"
								label="Last Name"
								name="lastName"
								autoComplete="family-name"
								value={formik.values.lastName}
								onChange={formik.handleChange}
								error={
									formik.touched.lastName && Boolean(formik.errors.lastName)
								}
								helperText={formik.touched.lastName && formik.errors.lastName}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								id="username"
								label="Username"
								name="username"
								autoComplete="username"
								value={formik.values.username}
								onChange={formik.handleChange}
								error={
									formik.touched.username && Boolean(formik.errors.username)
								}
								helperText={formik.touched.username && formik.errors.username}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								id="email"
								label="Email Address"
								name="email"
								autoComplete="email"
								value={formik.values.email}
								onChange={formik.handleChange}
								error={formik.touched.email && Boolean(formik.errors.email)}
								helperText={formik.touched.email && formik.errors.email}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								name="password"
								label="Password"
								type="password"
								id="password"
								autoComplete="new-password"
								value={formik.values.password}
								onChange={formik.handleChange}
								error={
									formik.touched.password && Boolean(formik.errors.password)
								}
								helperText={formik.touched.password && formik.errors.password}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								name="confirmPassword"
								label="Confirm Password"
								type="password"
								id="confirmPassword"
								value={formik.values.confirmPassword}
								onChange={formik.handleChange}
								error={
									formik.touched.confirmPassword &&
									Boolean(formik.errors.confirmPassword)
								}
								helperText={
									formik.touched.confirmPassword &&
									formik.errors.confirmPassword
								}
							/>
						</Grid>
					</Grid>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						sx={{
							mt: 3,
							mb: 2,
							backgroundColor: "#5c3d2e",
							"&:hover": {
								backgroundColor: "#b85c38",
							},
						}}
						disabled={isSubmitting}>
						{isSubmitting ? <CircularProgress size={24} /> : "Sign Up"}
					</Button>
					<Grid container justifyContent="flex-end">
						<Grid item>
							<Link component={RouterLink} to="/login" variant="body2">
								Already have an account? Sign in
							</Link>
						</Grid>
					</Grid>
				</Box>
			</Paper>
		</Container>
	);
};

export default RegisterPage;
