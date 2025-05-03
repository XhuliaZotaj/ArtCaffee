import React from "react";
import {
	Box,
	Container,
	Typography,
	Grid,
	Link,
	IconButton,
} from "@mui/material";
import {
	Facebook as FacebookIcon,
	Instagram as InstagramIcon,
	Twitter as TwitterIcon,
	LinkedIn as LinkedInIcon,
} from "@mui/icons-material";

const Footer: React.FC = () => {
	return (
		<Box
			component="footer"
			sx={{
				py: 3,
				px: 2,
				mt: "auto",
				backgroundColor: "#5c3d2e",
				color: "white",
			}}>
			<Container maxWidth="lg">
				<Grid container spacing={4}>
					<Grid item xs={12} sm={4}>
						<Typography variant="h6" gutterBottom>
							Digital Café
						</Typography>
						<Typography variant="body2">
							Experience coffee in a whole new way.
							<br />
							Order, earn points, and enjoy special offers.
						</Typography>
						<Box sx={{ mt: 2 }}>
							<IconButton color="inherit" aria-label="facebook">
								<FacebookIcon />
							</IconButton>
							<IconButton color="inherit" aria-label="instagram">
								<InstagramIcon />
							</IconButton>
							<IconButton color="inherit" aria-label="twitter">
								<TwitterIcon />
							</IconButton>
							<IconButton color="inherit" aria-label="linkedin">
								<LinkedInIcon />
							</IconButton>
						</Box>
					</Grid>

					<Grid item xs={12} sm={4}>
						<Typography variant="h6" gutterBottom>
							Quick Links
						</Typography>
						<ul style={{ listStyle: "none", padding: 0 }}>
							<li>
								<Link href="/" color="inherit" underline="hover">
									Home
								</Link>
							</li>
							<li>
								<Link href="/menu" color="inherit" underline="hover">
									Menu
								</Link>
							</li>
							<li>
								<Link href="/loyalty" color="inherit" underline="hover">
									Loyalty Program
								</Link>
							</li>
							<li>
								<Link href="/gift-cards" color="inherit" underline="hover">
									Gift Cards
								</Link>
							</li>
						</ul>
					</Grid>

					<Grid item xs={12} sm={4}>
						<Typography variant="h6" gutterBottom>
							Contact Us
						</Typography>
						<Typography variant="body2">
							123 Coffee Street
							<br />
							Bean City, BC 12345
							<br />
							Email: info@digitalcafe.com
							<br />
							Phone: (123) 456-7890
						</Typography>
					</Grid>
				</Grid>

				<Box mt={3}>
					<Typography variant="body2" align="center">
						© {new Date().getFullYear()} Digital Café. All rights reserved.
					</Typography>
				</Box>
			</Container>
		</Box>
	);
};

export default Footer;
