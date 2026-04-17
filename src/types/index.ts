// Core application types
export interface Update {
    id: string;
    headline: string;
    content: string | null;
    image_url: string | null;
    created_at: string;
    clicks: number | null;
    slug: string | null;
    external_link: string | null;
    author_name: string | null;
    author_avatar_url: string | null;
    category_id: string | null;
    updated_at: string;
    categories?: {
        name: string;
    };
}

export interface Tool {
    id: string;
    name: string;
    short_description: string | null;
    long_description: string | null;
    website_url: string | null;
    category_id: string | null;
    created_at: string;
    clicks: number | null;
    image_url: string | null;
    updated_at: string;
    categories?: {
        name: string;
    };
}

export interface Pdf {
    id: string;
    name: string;
    cover_image_url: string | null;
    drive_link: string;
    created_at: string;
    clicks: number | null;
    slug: string | null;
    description: string | null;
    category_id: string | null;
    author_name: string | null;
    author_avatar_url: string | null;
    updated_at: string;
    categories?: {
        name: string;
    };
}

export interface Category {
    id: string;
    name: string;
    entity_type: string;
    created_at: string;
}

export interface ToolCategory extends Category {
    tool_count?: number;
}

export interface PdfCategory extends Category {
    pdf_count?: number;
}

export interface PageView {
    id: string;
    path: string | null;
    created_at: string;
}

export interface Analytics {
    id: string;
    page: string;
    visitor_count: number;
    month: string;
    year: number;
    created_at: string;
}

// API Response types
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
}

// Component Props types
export interface CardProps {
    className?: string;
    children: React.ReactNode;
}

export interface LinkCardProps {
    to: string;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

// Search types
export interface SearchResult {
    type: 'update' | 'tool' | 'pdf';
    id: string;
    title: string;
    description: string;
    url: string;
    image?: string;
}

// User types
export interface User {
    id: string;
    email: string;
    role: 'admin' | 'user';
    created_at: string;
}

// Form types
export interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

// Analytics types
export interface AnalyticsData {
    totalVisits: number;
    uniqueVisitors: number;
    popularPages: Array<{
        path: string;
        visits: number;
    }>;
    trafficSources: Array<{
        source: string;
        count: number;
    }>;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
