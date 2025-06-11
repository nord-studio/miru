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

interface AutoIncidFailingProps {
	monitorNames: string[];
	url: string;
}

const AutoIncidFailing = ({ monitorNames = ["monitorNames"], url = "url" }: AutoIncidFailingProps) => (
	<Html>
		<Head />
		<Preview>{monitorNames.length === 1 ? `${monitorNames[0]} is` : "Some monitors are"} failing!</Preview>
		<Body style={main}>
			<Container style={container}>
				<Heading style={heading}>{monitorNames.length === 1 ? `${monitorNames[0]} is` : "Some monitors are"} failing!</Heading>
				<Text style={paragraph}>
					The monitoring service has detected that {" "}
					{monitorNames.length === 1 && `${monitorNames[0]} were recovering but are failing again.`}
					{monitorNames.length === 2 && `${monitorNames[0]} and ${monitorNames[1]} were recovering but are failing again.`}
					{monitorNames.length > 2 && `${monitorNames.length} monitors were recovering but are failing again.`} Click the
					button below to view the incident.
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

AutoIncidFailing.PreviewProps = {
	monitorNames: ["Website", "Campsite Gateway"],
	url: "https://miru.nordstud.io",
}

export default AutoIncidFailing;

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