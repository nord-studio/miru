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

interface WorkspaceInviteEmailProps {
  workspaceName: string;
  inviteToken: string;
  url: string;
}

const WorkspaceInviteEmail = ({
  url = "url",
  inviteToken = "inviteToken",
  workspaceName = "workspaceName",
}: WorkspaceInviteEmailProps) => (
  <Html>
    <Head />
    <Preview>Workspace Invite</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Workspace Invite</Heading>
        <Text style={paragraph}>
          You have been invited to join the workspace <b>{workspaceName}</b> on Miru. Click the
          button below to accept the invite.
        </Text>
        <Section style={buttonContainer}>
          <Button
            style={button}
            href={`${url}/join/${inviteToken}`}
          >
            Accept Invite
          </Button>
        </Section>
        <Text style={paragraph}>
          ...or use the invite token below to join the workspace manually:
        </Text>
        <code style={code}>{inviteToken}</code>
        <Hr style={hr} />
        <Text style={paragraph}>
          This invite will only be valid for the next 2 weeks. If you do not
          want to join this workspace, please ignore this email.
        </Text>
        <Text style={reportLink}>
          見る • Made by <Link href="https://nordstud.io">Nord Studio</Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

WorkspaceInviteEmail.PreviewProps = {
  workspaceName: "Nord Studio",
  inviteToken: "123abc",
  url: "http://localhost:3000",
};

export default WorkspaceInviteEmail;

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

const code = {
  fontFamily: "monospace",
  fontWeight: "700",
  padding: "1px 4px",
  backgroundColor: "#dfe1e4",
  letterSpacing: "-0.3px",
  fontSize: "21px",
  borderRadius: "4px",
  color: "#3c4149",
};
