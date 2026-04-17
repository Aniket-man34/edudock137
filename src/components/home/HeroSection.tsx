import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border/40 p-8 md:p-12 mb-8"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium text-primary/80">Welcome to EduDock</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground mb-4 leading-tight">
                    Your Gateway to
                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {' '}Educational Excellence
                    </span>
                </h1>

                <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                    Discover curated tools, PDFs, and updates designed to enhance your learning journey
                </p>

                <div className="flex flex-wrap gap-4">
                    <Link
                        to="/tools"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Explore Tools
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                        to="/pdfs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-background border border-border rounded-xl font-medium hover:bg-muted transition-colors"
                    >
                        Browse PDFs
                    </Link>
                </div>
            </div>
        </motion.section>
    );
}