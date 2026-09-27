// src/pages/devtrust/api/RateLimits.tsx
import { InfoBox, MetricCard } from '../../../components/devtrust/Primitives';
import CodeBlock from '../../../components/devtrust/CodeBlock';

export default function RateLimits() {
  return (
    <>
      <h1 className="dt-title">Rate Limits</h1>
      <p className="dt-subtitle">
        API request limits and throttling policies to ensure fair usage.
      </p>

      <h2 className="dt-section-title">Default Limits</h2>
      <div className="dt-metrics">
        <MetricCard label="Per Minute" value="100" note="Requests per API key" />
        <MetricCard label="Burst" value="10" note="Requests per second" />
        <MetricCard label="Retry-After" value="60s" note="On 429 response" />
        <MetricCard label="Enterprise" value="Custom" note="Contact for higher limits" />
      </div>

      <h2 className="dt-section-title">Rate Limit Headers</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 12 }}>
          All API responses include rate limit information in headers:
        </p>
      </div>
      <CodeBlock lang="HTTP Headers">{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1704556920`}</CodeBlock>

      <h2 className="dt-section-title">429 Response</h2>
      <CodeBlock lang="JSON">{`{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please retry after 60 seconds.",
  "retry_after": 60
}`}</CodeBlock>

      <InfoBox title="💡 Best Practices">
        Implement exponential backoff for retries. Respect <code>Retry-After</code> header.
        Cache responses when possible. Contact{' '}
        <a href="mailto:integrations@lookara.com">integrations@lookara.com</a> for enterprise limits.
      </InfoBox>
    </>
  );
}