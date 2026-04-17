import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold font-display">Privacy Policy</h1>
        </div>
        <p className="text-muted-foreground italic mb-10">Last Updated: April 5, 2026</p>

        <div className="space-y-8">
          <section className="glass-card p-6">
            <h2 className="text-xl font-bold font-display mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to EduDock (edudock.in). We are committed to protecting your personal information and your right to privacy. This policy explains how we handle your data when you use our services.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-bold font-display mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you interact with our platform, we may collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Analytics Data:</strong> Anonymous usage data to improve our services.</li>
              <li><strong className="text-foreground">Contact Data:</strong> Information you provide when communicating with us.</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-bold font-display mb-3">3. How We Use Your Data</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              EduDock uses the collected data to maintain and improve the platform.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To track site analytics and optimize user experience.</li>
              <li>We do <strong className="text-foreground">not</strong> sell your data or use it for marketing.</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-bold font-display mb-3">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use <strong className="text-foreground">Supabase</strong> (an open-source Firebase alternative) to securely store our database and handle authentication logic. Your email and name are stored on Supabase's secure servers.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-bold font-display mb-3">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-bold font-display mb-3">6. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this policy, contact us at: <strong className="text-foreground">support@edudock.in</strong>
            </p>
          </section>
        </div>

        {/* Footer link */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            Also see our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
