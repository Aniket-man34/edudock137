import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground italic">Last Updated: April 5, 2026</p>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
          <p>By accessing the EduDock Admin Panel, you agree to comply with these terms. This panel is for authorized administrators only.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">2. Admin Responsibilities</h2>
          <p>As an administrator, you agree not to upload any illegal, copyrighted (without permission), or harmful material to the EduDock platform. You are responsible for maintaining the security of your Google account used for login.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">3. Termination</h2>
          <p>We reserve the right to revoke administrative access at any time if these terms are violated.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">4. Disclaimer</h2>
          <p>The materials on EduDock are provided "as is". We make no warranties regarding the accuracy or reliability of content uploaded by third parties.</p>
        </section>
      </motion.div>
    </div>
  );
}