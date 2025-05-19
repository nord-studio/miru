import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

const ResetPasswordEmail = ({ url = "url" }: { url: string }) => (
	<Html>
		<Head />
		<Preview>Reset Password</Preview>
		<Body style={main}>
			<Container style={container}>
				<Heading style={heading}>It happens to the best of us</Heading>
				<Text style={paragraph}>
					Click the button below to reset your password.
				</Text>
				<Section style={buttonContainer}>
					<Button
						style={button}
						href={url}
					>
						Reset Password
					</Button>
				</Section>
				<Text style={paragraph}>
					This link will only be valid for the next hour. If you didn&apos;t request
					this email, please ignore it.
				</Text>
				<Hr style={hr} />
				<Text style={reportLink}>
					見る • Made by <Link href="https://nordstud.io">Nord Studio</Link>
				</Text>
			</Container>
		</Body>
	</Html>
);

ResetPasswordEmail.PreviewProps = {
	url: "https://miru.nordstud.io",
};

export default ResetPasswordEmail;

const main = {
	backgroundColor: "#ffffff",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	margin: "0 auto",
	padding: "20px 0 48px",
	maxWidth: "560px",
	textAlign: "center" as const
};

const heading = {
	fontSize: "24px",
	letterSpacing: "-0.5px",
	lineHeight: "1.3",
	fontWeight: "400",
	color: "#484848",
	padding: "17px 0 0",
};

const paragraph = {
	margin: "0 0 15px",
	fontSize: "15px",
	lineHeight: "1.4",
	color: "#3c4149",
};

const buttonContainer = {
	padding: "8px 0 28px",
};

const button = {
	backgroundColor: "#121212",
	borderRadius: "8px",
	fontWeight: "600",
	color: "#fff",
	fontSize: "15px",
	textDecoration: "none",
	display: "block",
	padding: "12px 24px",
	margin: "0 auto",
	width: "140px"
};

const reportLink = {
	fontSize: "14px",
	color: "#b4becc",
};

const hr = {
	borderColor: "#dfe1e4",
	margin: "42px 0 26px",
};
