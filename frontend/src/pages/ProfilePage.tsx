import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import {
	Container,
	Typography,
	Box,
	Paper,
	Grid,
	Card,
	CardContent,
	Button,
	Divider,
	TextField,
	CircularProgress,
	Avatar,
} from "@mui/material";
import {
	Person as PersonIcon,
	Edit as EditIcon,
	Save as SaveIcon,
	Cancel as CancelIcon,
} from "@mui/icons-material";

const ProfilePage: React.FC = () => {
	const navigate = useNavigate();
	const { user, getProfile } = useAuth();
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [formData, setFormData] = useState({
		firstName: user?.first_name || "",
		lastName: user?.last_name || "",
		email: user?.email || "",
	});

	if (!user) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
				<CircularProgress />
			</Box>
		);
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleEditToggle = () => {
		if (isEditing) {
			// Reset form data if canceling edit
			setFormData({
				firstName: user.first_name || "",
				lastName: user.last_name || "",
				email: user.email,
			});
		}
		setIsEditing(!isEditing);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			// In a real app, you would make an API call to update the profile
			// await axios.put('/api/auth/profile', {
			//   first_name: formData.firstName,
			//   last_name: formData.lastName,
			//   email: formData.email
			// });

			// For now, just simulate a delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Refresh user profile
			await getProfile();

			setIsEditing(false);
			toast.success("Profile updated successfully!");
		} catch (error) {
			console.error("Error updating profile:", error);
			toast.error("Failed to update profile. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const getInitials = () => {
		const firstInitial = user.first_name ? user.first_name.charAt(0) : "";
		const lastInitial = user.last_name ? user.last_name.charAt(0) : "";
		return (
			(firstInitial + lastInitial).toUpperCase() ||
			user.username.charAt(0).toUpperCase()
		);
	};

	return (
		<Container maxWidth="md" sx={{ my: 5 }}>
			<Typography variant="h4" component="h1" gutterBottom>
				My Profile
			</Typography>

			<Paper elevation={3} sx={{ p: 3, mt: 3 }}>
				<Grid container spacing={4}>
					<Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
						<Avatar
							sx={{
								width: 120,
								height: 120,
								mx: "auto",
								bgcolor: "#5c3d2e",
								fontSize: "2.5rem",
							}}>
							{getInitials()}
						</Avatar>
						<Typography variant="h6" sx={{ mt: 2 }}>
							{user.username}
						</Typography>
						<Box sx={{ mt: 2 }}>
							<Button
								variant={isEditing ? "outlined" : "contained"}
								startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
								onClick={handleEditToggle}
								sx={{
									backgroundColor: isEditing ? undefined : "#5c3d2e",
									"&:hover": {
										backgroundColor: isEditing ? undefined : "#b85c38",
									},
								}}>
								{isEditing ? "Cancel" : "Edit Profile"}
							</Button>
						</Box>
					</Grid>

					<Grid item xs={12} md={8}>
						<Box component="form" onSubmit={handleSubmit}>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										label="First Name"
										name="firstName"
										value={formData.firstName}
										onChange={handleInputChange}
										disabled={!isEditing}
										variant={isEditing ? "outlined" : "filled"}
										margin="normal"
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										label="Last Name"
										name="lastName"
										value={formData.lastName}
										onChange={handleInputChange}
										disabled={!isEditing}
										variant={isEditing ? "outlined" : "filled"}
										margin="normal"
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										disabled={!isEditing}
										variant={isEditing ? "outlined" : "filled"}
										margin="normal"
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Username"
										value={user.username}
										disabled
										variant="filled"
										margin="normal"
									/>
								</Grid>
								{isEditing && (
									<Grid item xs={12} sx={{ mt: 2, textAlign: "right" }}>
										<Button
											type="submit"
											variant="contained"
											startIcon={<SaveIcon />}
											disabled={loading}
											sx={{
												backgroundColor: "#5c3d2e",
												"&:hover": {
													backgroundColor: "#b85c38",
												},
											}}>
											{loading ? (
												<CircularProgress size={24} />
											) : (
												"Save Changes"
											)}
										</Button>
									</Grid>
								)}
							</Grid>
						</Box>
					</Grid>
				</Grid>
			</Paper>

			<Card sx={{ mt: 4 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Account Information
					</Typography>
					<Divider sx={{ mb: 2 }} />

					<Grid container spacing={2}>
						<Grid item xs={6}>
							<Typography variant="body2" color="text.secondary">
								Loyalty Points:
							</Typography>
							<Typography variant="body1" sx={{ fontWeight: "bold" }}>
								{user.loyalty_points} points
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography variant="body2" color="text.secondary">
								Member Since:
							</Typography>
							<Typography variant="body1">June 2023</Typography>
						</Grid>
						<Grid item xs={12} sx={{ mt: 2 }}>
							<Button
								variant="outlined"
								onClick={() => navigate("/loyalty")}
								sx={{
									color: "#5c3d2e",
									borderColor: "#5c3d2e",
									"&:hover": {
										borderColor: "#b85c38",
										backgroundColor: "rgba(92, 61, 46, 0.04)",
									},
								}}>
								View Loyalty Program
							</Button>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		</Container>
	);
};

export default ProfilePage;
