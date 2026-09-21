import { useNavigate } from "react-router-dom";

function ChatPrivacyPage() {
  const navigate = useNavigate();

  return (
    <section className="du-chat-privacy-page du-page-scroll">
      <article className="du-panel du-chat-privacy-card">
        <header className="du-chat-privacy-header">
          <div>
            <p className="du-details-eyebrow">Privacy & Safety</p>
            <h1>How Crazy Desert Chat protects conversations</h1>
          </div>
          <button
            type="button"
            className="du-button du-button-small du-button-rect"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </header>

        <p className="du-chat-privacy-lead">
          This notice explains the current chat design clearly. It does not
          claim end-to-end encryption where none exists.
        </p>

        <div className="du-chat-privacy-grid">
          <section>
            <h2>Private conversations</h2>
            <p>
              A direct conversation is available through the site only to its
              two participants. Administrators do not have a tool for browsing
              ordinary private chats.
            </p>
          </section>

          <section>
            <h2>Administration</h2>
            <p>
              The clearly labelled Administration conversation is a support channel.
              Messages and screenshots sent there can be read by every
              currently assigned administrator who needs to handle site issues.
            </p>
          </section>

          <section>
            <h2>Reports</h2>
            <p>
              When a participant reports abuse, only the selected message and
              the report details are placed in the administrators’ review
              queue. The rest of the private conversation is not exposed by
              that report.
            </p>
          </section>

          <section>
            <h2>Technical protection</h2>
            <p>
              Message text and attached images are encrypted in storage using
              AES-256-GCM. Images are restricted to supported formats, limited
              in size, and stripped of common location and camera metadata.
              Production traffic must also use HTTPS.
            </p>
          </section>

          <section>
            <h2>Not end-to-end encrypted</h2>
            <p>
              The service backend holds the key required to deliver messages,
              so an authorized operator with server-level access can
              technically decrypt them. Users should not treat this chat like
              an end-to-end encrypted secret messenger.
            </p>
          </section>

          <section>
            <h2>Safety controls</h2>
            <p>
              Participants can block another user, keep their existing history,
              and report a specific abusive message. Message-rate limits help
              reduce automated spam.
            </p>
          </section>

          <section>
            <h2>Stored information</h2>
            <p>
              The service stores participants, encrypted content, attachments,
              timestamps, read state, blocks, and reports. Hosting providers may
              also process security logs and network metadata needed to operate
              the service.
            </p>
          </section>

          <section>
            <h2>Legal requests and retention</h2>
            <p>
              Information may be preserved or disclosed when legally required.
              In this first version, messages remain stored while the service
              operates; a defined deletion schedule and user deletion controls
              must be completed before a broad public launch.
            </p>
          </section>
        </div>

        <p className="du-chat-privacy-note">
          Pre-launch product notice · Last updated September 21, 2026. A final
          legal privacy policy should be reviewed for the countries where the
          club is offered.
        </p>
      </article>
    </section>
  );
}

export default ChatPrivacyPage;
