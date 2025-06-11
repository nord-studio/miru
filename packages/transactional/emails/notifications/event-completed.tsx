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

interface EventCompletedEmailProps {
	eventName: string;
	monitorNames: string[];
	date: string;
	time: string;
	url: string;
}

const EventCompletedEmail = ({ monitorNames = ["monitorNames"], url = "url", date = "date", time = "time", eventName = "eventName" }: EventCompletedEmailProps) => (
	<Html>
		<Head />
		<Preview>An event has been completed</Preview>
		<Body style={main}>
			<Container style={container}>
				<Heading style={heading}>An event has been completed</Heading>
				<Text style={paragraph}>
					A planned event called "<b>{eventName}</b>" is complete and {" "}
					{monitorNames.length === 1 && `the monitor ${monitorNames[0]} is`}
					{monitorNames.length === 2 && `the monitors ${monitorNames[0]} and ${monitorNames[1]} are`}
					{monitorNames.length > 2 && `${monitorNames.length} monitors are`} stable again. The event ended <b>{date}</b> at <b>{time}</b>.
				</Text>
				<Section style={buttonContainer}>
					<Button style={button} href={url}>
						View Event
					</Button>
				</Section>
				<Hr style={hr} />
				<Text style={reportLink}>
					見る • Made by <Link href="https://nordstud.io">Nord Studio</Link>
				</Text>
			</Container>
		</Body>
	</Html >
);

EventCompletedEmail.PreviewProps = {
	eventName: "Moving to a new server",
	monitorNames: ["Website", "Campsite Gateway"],
	url: "https://miru.nordstud.io",
	date: "23rd May 2025",
	time: "12:00pm UTC"
}

export default EventCompletedEmail;

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