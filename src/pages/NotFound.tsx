import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSiteSeo } from '@/hooks/useSiteSeo';
import { SEO_DEFAULTS, SITE_URL, PAGE_SEO } from '@/lib/seo';

function NotFoundHelmet() {
  const { data: seo } = useSiteSeo("notFound");
  const defaults = PAGE_SEO.notFound;
  const title = seo?.meta_title?.trim() || defaults.title;
  const description = seo?.meta_description?.trim() || defaults.description;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex, follow" />
      <link rel="canonical" href={SITE_URL} />
    </Helmet>
  );
}

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <NotFoundHelmet />
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            Return to Home
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
