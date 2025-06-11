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

interface IncidentReportCreatedEmailProps {
	incidentName: string;
	url: string;
}

const IncidentReportCreatedEmail = ({ incidentName = "incidentName", url = "url" }: IncidentReportCreatedEmailProps) => (
	<Html>
		<Head />
		<Preview>An incident got an update!</Preview>
		<Body style={main}>
			<Container style={container}>
				<Heading style={heading}><b>{incidentName}</b> got an update!</Heading>
				<Text style={paragraph}>
					The incident <b>{incidentName}</b> has been updated with a new report. You can click the
					button below to view the incident report.
				</Text>
				<Section style={buttonContainer}>
					<Button style={button} href={url}>
						View Incident
					</Button>
				</Section>
				<Hr style={hr} />
				<Text style={reportLink}>
					見る • Made by <Link href="https://nordstud.io">Nord Studio</Link>
				</Text>
			</Container>
		</Body>
	</Html>
);

IncidentReportCreatedEmail.PreviewProps = {
	incidentName: "Problems with server",
	url: "https://miru.nordstud.io",
}

export default IncidentReportCreatedEmail;

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
	padding: "8px 0px 0px",
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