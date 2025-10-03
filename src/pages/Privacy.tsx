import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
              <p>
                Campaign Craft ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and protect your information when you use our analytics and tracking services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Data We Collect</h2>
              <h3 className="text-xl font-semibold mb-2">Account Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Email address (for authentication)</li>
                <li>Display name and avatar (optional)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">Analytics & Tracking Data</h3>
              <p>When you install our tracking script on your website, we collect:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>IP Address:</strong> Used for geographic analytics and fraud prevention (anonymized after 30 days)</li>
                <li><strong>Visitor ID:</strong> A unique identifier stored in browser localStorage to track unique visitors</li>
                <li><strong>Page Path:</strong> The URL path visited (query parameters are removed to protect privacy)</li>
                <li><strong>Click Events:</strong> Elements clicked on your website (sanitized to remove personal information)</li>
                <li><strong>Device Information:</strong> Browser type, device type (mobile/tablet/desktop)</li>
                <li><strong>Referrer:</strong> The website that referred the visitor</li>
                <li><strong>UTM Parameters:</strong> Campaign tracking parameters</li>
                <li><strong>Screen Recordings:</strong> Optional feature that must be explicitly enabled</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">How We Use Your Data</h2>
              <ul className="list-disc pl-6">
                <li>Provide analytics and insights about your marketing campaigns</li>
                <li>Track visitor behavior and conversions</li>
                <li>Prevent fraudulent tracking and abuse</li>
                <li>Improve our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
              <p>
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6">
                <li>Encryption of data in transit and at rest</li>
                <li>Rate limiting to prevent abuse</li>
                <li>Regular security audits</li>
                <li>Row-Level Security (RLS) policies to protect user data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Data Retention</h2>
              <ul className="list-disc pl-6">
                <li>IP addresses are anonymized after 30 days</li>
                <li>Tracking events are retained for 90 days by default</li>
                <li>You can delete your campaigns and associated tracking data at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and all associated data</li>
                <li>Export your data</li>
                <li>Opt-out of tracking (via Do Not Track browser setting)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Cookies & Local Storage</h2>
              <p>
                Our tracking script uses browser localStorage to store:
              </p>
              <ul className="list-disc pl-6">
                <li><code>cc_visitor_id</code>: Unique visitor identifier</li>
                <li><code>cc_record_screen</code>: Screen recording preference (if enabled)</li>
              </ul>
              <p className="mt-2">
                No third-party cookies are used. You can clear these at any time through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Third-Party Services</h2>
              <p>
                We use Supabase for data storage and authentication. Supabase's privacy policy can be found at{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  https://supabase.com/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by updating the 
                "Last updated" date at the top of this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
              <p>
                If you have questions about this privacy policy or your data, please contact us through your account dashboard.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;