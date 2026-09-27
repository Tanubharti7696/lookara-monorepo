import { InfoBox, WarningBox, MetricCard } from '../../../components/devtrust/Primitives';

export default function Overview() {
	return (
		<>
			<h1 className="dt-title">Developer Trust Portal</h1>
			<p className="dt-subtitle">
				Operations OS for STR property managers. Security-first architecture designed for OTA
				partner review and API integration confidence.
			</p>

			<div className="dt-quote">
				<p>"Built to support platforms, not bypass them."</p>
			</div>

			<div className="dt-metrics">
				<MetricCard label="Audit Log" value="ON" note="Immutable, append-only" success />
				<MetricCard label="RBAC" value="ON" note="Property-scoped access" success />
				<MetricCard label="Encryption" value="ON" note="TLS 1.3 + AES-256" success />
				<MetricCard label="SOC 2 Type I" value="Planned" note="Control framework implemented" />
			</div>

			<h2 className="dt-section-title">What Lookara Is</h2>
			<div className="dt-two-col">
				<div className="dt-col-card is-positive">
					<h4>✓ Operations OS (Phase 1)</h4>
					<ul>
						<li>Task orchestration &amp; vendor dispatch</li>
						<li>Compliance tracking &amp; deadlines</li>
						<li>Emergency Mode (PM-controlled)</li>
						<li>Audit trail (all actions logged)</li>
						<li>Property portfolio management</li>
					</ul>
				</div>
				<div className="dt-col-card is-negative">
					<h4>✗ NOT a Marketplace</h4>
					<ul>
						<li>No guest portal (Phase 1)</li>
						<li>No booking creation/modification</li>
						<li>No guest messaging content</li>
						<li>No pricing or availability updates</li>
						<li>No payment processing</li>
					</ul>
				</div>
			</div>

			<h2 className="dt-section-title">Data Scope &amp; Minimization</h2>
			<div className="dt-two-col">
				<div className="dt-col-card is-positive">
					<h4>✓ What We Collect</h4>
					<ul>
						<li>Property metadata (address, amenities)</li>
						<li>Operational tasks &amp; status</li>
						<li>Vendor profiles &amp; SLA metrics</li>
						<li>Audit events (who/what/when/where)</li>
						<li>Calendar sync (check-in/out dates only)</li>
					</ul>
				</div>
				<div className="dt-col-card is-negative">
					<h4>✗ What We DON'T Collect</h4>
					<ul>
						<li>Guest names, emails, phone numbers</li>
						<li>Payment information or transactions</li>
						<li>Message content or communications</li>
						<li>Booking references or reservation details</li>
						<li>Review content or ratings</li>
					</ul>
				</div>
			</div>

			<WarningBox title="⚠ Phase 1 Scope Limitation">
				Lookara Phase 1 is operations-focused. Guest-facing features (portal, messaging,
				marketplace) are out of scope. Integration review should focus on operational data
				flows only.
			</WarningBox>

			<h2 className="dt-section-title">Trust Principles</h2>
			<div className="dt-card">
				<p className="dt-text" style={{ marginBottom: 12 }}>
					Lookara is built on three foundational trust principles designed to support OTA
					partner confidence and security review approval:
				</p>
				<ul className="dt-principles">
					<li>
						<span className="dt-principle__num">1.</span>
						<span><strong>Audit-First Architecture:</strong> Every action writes to an immutable audit log—no retroactive edits, no data loss.</span>
					</li>
					<li>
						<span className="dt-principle__num">2.</span>
						<span><strong>Least-Privilege Access:</strong> Users see only properties they manage. Vendors see only assigned tasks. Role + property scope enforced.</span>
					</li>
					<li>
						<span className="dt-principle__num">3.</span>
						<span><strong>Incident-Ready Operations:</strong> Emergency Mode operates independently with SMS/voice fallback—does not rely solely on web interface. Emergency Mode coordinates internal operational response only and does not initiate guest contact or modify platform communications.</span>
					</li>
				</ul>
			</div>

			<h2 className="dt-section-title">Platform Respect Guarantee</h2>

			<div className="dt-quote dt-quote--inline">
				<p>"Built to support platforms, not bypass them."</p>
			</div>

			<InfoBox title="🤝 Non-Circumvention Commitment">
				Lookara does not bypass, replace, or interfere with OTA guest relationships. All guest
				discovery, booking, communication, pricing, and payments remain exclusively within
				partner platforms.
			</InfoBox>

			<div className="dt-card dt-card--accent">
				<p className="dt-text">
					<strong>Platform Safety Value:</strong> Lookara reduces platform risk by providing
					property managers with operational visibility that prevents guest-facing incidents
					before they escalate to platform support channels. Better operations mean fewer guest
					complaints, fewer emergency escalations, and reduced platform support burden.
				</p>
			</div>

			<h2 className="dt-section-title">Explicit Non-Goals</h2>
			<div className="dt-card">
				<p className="dt-text" style={{ marginBottom: 12 }}>
					To ensure long-term platform trust, Lookara will <strong>never</strong> build the following capabilities:
				</p>
				<ul className="dt-principles">
					{[
						['Guest messaging:', 'No direct communication channel between Lookara and guests'],
						['Pricing optimization:', 'No dynamic pricing algorithms or rate suggestions'],
						['Booking creation/modification:', 'No ability to create, cancel, or alter reservations'],
						['Review management:', 'No review response automation or sentiment manipulation'],
						['Direct guest contact:', 'No email, SMS, or phone contact initiated by Lookara to guests'],
						['Website scraping or reverse engineering:', 'Lookara does not scrape partner websites or reverse-engineer private APIs'],
					].map(([label, rest]) => (
						<li key={label}>
							<span className="dt-principle__x">✗</span>
							<span><strong>{label}</strong> {rest}</span>
						</li>
					))}
				</ul>
			</div>

			<h2 className="dt-section-title">Integration Philosophy</h2>
			<div className="dt-card">
				<p className="dt-text">
					Lookara uses <strong>thin adapters</strong> and an <strong>event-driven backbone</strong> for
					partner integrations. This architecture allows OTA connections to expand (Airbnb →
					Booking.com → VRBO) without platform refactors or breaking changes. We prioritize{' '}
					<strong>operational event triggers</strong> (check-in, maintenance requests) over guest
					data access.
				</p>
			</div>
		</>
	);
}
