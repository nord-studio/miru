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
} from "jsx-email";
import * as React from "react";
import { getAppUrl } from "../utils";

interface WorkspaceInviteEmailProps {
  workspaceName: string;
  inviteToken: string;
}

const appUrl = getAppUrl();

const WorkspaceInviteEmail = ({
  inviteToken,
  workspaceName,
}: WorkspaceInviteEmailProps) => (
  <Html>
    <Head />
    <Preview>Workspace Invite</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Workspace Invite</Heading>
        <Text style={paragraph}>
          You have been invited to join {workspaceName} on Miru. Click the
          button below to accept the invite.
        </Text>
        <div>
          <Section style={buttonContainer}>
            <Button
              style={button}
              height={25}
              width={160}
              href={`${appUrl}/join/${inviteToken}`}
            >
              Accept Invite
            </Button>
          </Section>
          <Text style={paragraph}>
            ...or use the invite token below to join the workspace manually:
          </Text>
          <code style={code}>{inviteToken}</code>
        </div>
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
  padding: "8px 0 27px",
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
  margin: "0 auto",
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
