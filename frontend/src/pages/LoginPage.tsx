import React, { useState, useEffect } from "react";
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
	Alert,
	Chip,
} from "@mui/material";
import {
	LockOutlined as LockOutlinedIcon,
	AccountCircle as AccountIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
	email: Yup.string()
		.email("Enter a valid email")
		.required("Email is required"),
	password: Yup.string().required("Password is required"),
});

const LoginPage: React.FC = () => {
	const { login, savedCredentials } = useAuth();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const formik = useFormik({
		initialValues: {
			email: "",
			password: "",
		},
		validationSchema: validationSchema,
		onSubmit: async (values) => {
			setIsSubmitting(true);
			try {
				await login(values.email, values.password);
				toast.success("Login successful!");
				navigate("/");
			} catch (error: any) {
				const errorMessage =
					error.response?.data?.error || "Login failed. Please try again.";
				toast.error(errorMessage);
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	// Auto-fill the form if saved credentials are available
	useEffect(() => {
		if (savedCredentials) {
			formik.setValues({
				email: savedCredentials.email,
				password: savedCredentials.password,
			});
		}
	}, [savedCredentials]); // eslint-disable-line react-hooks/exhaustive-deps

	const useSavedCredentials = () => {
		if (savedCredentials) {
			formik.setValues({
				email: savedCredentials.email,
				password: savedCredentials.password,
			});
			formik.submitForm();
		}
	};

	return (
		<Container component="main" maxWidth="xs">
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
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Sign in
				</Typography>

				{savedCredentials && (
					<Alert severity="info" sx={{ mt: 2, width: "100%" }}>
						<Typography variant="body2" gutterBottom>
							Saved credentials from previous session:
						</Typography>
						<Chip
							icon={<AccountIcon />}
							label={savedCredentials.email}
							onClick={useSavedCredentials}
							color="primary"
							sx={{
								mt: 1,
								cursor: "pointer",
								bgcolor: "#5c3d2e",
								"&:hover": {
									bgcolor: "#b85c38",
								},
							}}
						/>
						<Typography variant="caption" sx={{ display: "block", mt: 1 }}>
							Click the chip to use saved credentials
						</Typography>
					</Alert>
				)}

				<Box
					component="form"
					onSubmit={formik.handleSubmit}
					noValidate
					sx={{ mt: 1, width: "100%" }}>
					<TextField
						margin="normal"
						required
						fullWidth
						id="email"
						label="Email Address"
						name="email"
						autoComplete="email"
						autoFocus
						value={formik.values.email}
						onChange={formik.handleChange}
						error={formik.touched.email && Boolean(formik.errors.email)}
						helperText={formik.touched.email && formik.errors.email}
					/>
					<TextField
						margin="normal"
						required
						fullWidth
						name="password"
						label="Password"
						type="password"
						id="password"
						autoComplete="current-password"
						value={formik.values.password}
						onChange={formik.handleChange}
						error={formik.touched.password && Boolean(formik.errors.password)}
						helperText={formik.touched.password && formik.errors.password}
					/>
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
						{isSubmitting ? <CircularProgress size={24} /> : "Sign In"}
					</Button>
					<Grid container>
						<Grid item xs>
							<Link component={RouterLink} to="#" variant="body2">
								Forgot password?
							</Link>
						</Grid>
						<Grid item>
							<Link component={RouterLink} to="/register" variant="body2">
								{"Don't have an account? Sign Up"}
							</Link>
						</Grid>
					</Grid>
				</Box>
			</Paper>
		</Container>
	);
};

export default LoginPage;
