
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
	render,
	Section,
	Text,
} from "jsx-email";
import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import * as React from "react";

export default async function sendEmailVerification(
	email: string,
	url: string,
) {
	if (!process.env.ENABLE_EMAIL) {
		throw new Error(
			"Emails are not enabled on this instance. If you are the instance administator, set ENABLE_EMAIL to true in your .env file."
		);
	}

	const transporter = createTransport({
		host: process.env.SMTP_HOST,
		secure: process.env.SMTP_SECURE === 'true',
		port: Number(process.env.SMTP_PORT),
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
		debug: process.env.NODE_ENV === "development",
	} as SMTPTransport.Options);

	const body = await render(<VerifyAccountEmail url={url} />);

	await transporter
		.sendMail({
			from: process.env.SMTP_FROM,
			to: email,
			subject: "Password Reset Request",
			html: body,
		})
		.catch((err) => {
			console.error(err);
		});
}

interface VerifyAccountEmailProps {
	url: string;
}

const baseUrl = process.env.NODE_ENV === "production" ?
	`https://${global.secrets.domain}` :
	"http://localhost:3000";

const VerifyAccountEmail = ({
	url,
}: VerifyAccountEmailProps) => (
	<Html>
		<Head />
		<Preview>Welcome to Miru!</Preview>
		<Body style={main}>
			<Container style={container}>
				<Heading style={heading}>Welcome to Miru!</Heading>
				<Section style={buttonContainer}>
					<Button style={button} height={25} width={100} href={url}>
						Verify Account
					</Button>
				</Section>
				<Text style={paragraph}>
					This link will only be valid for the next hour. If you did not request
					this, you can safely ignore this email.
				</Text>
				<Hr style={hr} />
				<Text style={reportLink}>
					見る • Made by{" "}
					<Link href="https://nordstud.io">Nord Studio</Link>
				</Text>
			</Container>
		</Body>
	</Html>
);

VerifyAccountEmail.PreviewProps = {
	url: `${baseUrl}/verify-account`,
} as VerifyAccountEmailProps;

const main = {
	backgroundColor: "#ffffff",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	margin: "0 auto",
	padding: "20px 0 48px",
	maxWidth: "560px",
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
	padding: "27px 0 27px",
};

const button = {
	backgroundColor: "#121212",
	borderRadius: "3px",
	fontWeight: "600",
	color: "#fff",
	fontSize: "15px",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "block",
	padding: "11px 23px",
	marginLeft: "auto",
	marginRight: "auto"
};

const reportLink = {
	fontSize: "14px",
	color: "#b4becc",
};

const hr = {
	borderColor: "#dfe1e4",
	margin: "42px 0 26px",
};