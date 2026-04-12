import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground italic">Last Updated: April 5, 2026</p>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">1. Introduction</h2>
          <p>Welcome to EduDock (edudock.in). We are committed to protecting your personal information and your right to privacy. This policy explains how we handle your data when you use our administrative services via Google OAuth.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">2. Information We Collect</h2>
          <p>When you log in to our admin panel using Google OAuth, we collect:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Basic Profile Information:</strong> Your full name, email address, and profile picture URL.</li>
            <li><strong>Authentication Data:</strong> A unique identifier provided by Google to verify your identity.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">3. How We Use Your Data</h2>
          <p>EduDock's use and transfer of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy#limited-use-requirements" className="text-primary underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>To identify you as an authorized administrator.</li>
            <li>To display your name and profile picture on posts or updates you publish.</li>
            <li>We do <strong>not</strong> sell your data or use it for marketing.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">4. Third-Party Services</h2>
          <p>We use <strong>Supabase</strong> (an open-source Firebase alternative) to securely store our database and handle authentication logic. Your email and name are stored on Supabase's secure servers.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">5. Contact Us</h2>
          <p>If you have questions about this policy, contact us at: <strong>support@edudock.in</strong></p>
        </section>
      </motion.div>
    </div>
  );
}