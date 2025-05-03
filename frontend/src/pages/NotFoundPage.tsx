import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography, Paper } from "@mui/material";
import {
	SentimentDissatisfied as SadIcon,
	ArrowBack as BackIcon,
} from "@mui/icons-material";

const NotFoundPage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<Container maxWidth="md" sx={{ my: 8 }}>
			<Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
				<SadIcon sx={{ fontSize: 100, color: "#b85c38", mb: 3 }} />

				<Typography variant="h3" gutterBottom>
					404
				</Typography>

				<Typography variant="h5" gutterBottom>
					Page Not Found
				</Typography>

				<Typography
					variant="body1"
					color="text.secondary"
					paragraph
					sx={{ mt: 2 }}>
					The page you're looking for doesn't exist or has been moved.
				</Typography>

				<Box sx={{ mt: 4 }}>
					<Button
						variant="contained"
						startIcon={<BackIcon />}
						onClick={() => navigate("/")}
						sx={{
							backgroundColor: "#5c3d2e",
							"&:hover": {
								backgroundColor: "#b85c38",
							},
						}}>
						Back to Home
					</Button>
				</Box>
			</Paper>
		</Container>
	);
};

export default NotFoundPage;
