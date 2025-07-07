import {
  HEADER_HTML,
  FOOTER_HTML,
  SHARED_STYLES,
  SHARED_SCRIPTS,
  ORGANIZATION_SCHEMA,
} from './components.js';

export const UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-TPNEVYDVH8"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-TPNEVYDVH8');
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SLOP News 24/7</title>
    <link rel="icon" href="https://image.slop247.com/icon.png?23">
    <meta name="description" content="Southern Louisiana Operationalized Partition - Your trusted source for news and analysis to get you through the hour">
    <meta name="keywords" content="news, Louisiana, Southern Louisiana, operational news, partition analysis">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="SLOP News 24/7">
    <meta property="og:title" content="SLOP News 24/7 - Southern Louisiana Operationalized Partition">
    <meta property="og:description" content="Southern Louisiana Operationalized Partition - Your trusted source for news and analysis to get you through the hour">
    <script type="application/ld+json">
    ${JSON.stringify(ORGANIZATION_SCHEMA)}
    </script>
    <style>
        ${SHARED_STYLES}
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        .stories {
            display: block;
        }
        .story {
            border-bottom: 1px solid #ddd;
            padding: 20px 0;
            margin-bottom: 20px;
            display: flex;
            align-items: flex-start;
            gap: 24px;
        }
        .story:last-child {
            border-bottom: none;
        }
        .story-image {
            width: 120px;
            flex-shrink: 0;
            margin-right: 16px;
        }
        .story-image img {
            width: 100%;
            height: auto;
            border-radius: 4px;
            object-fit: cover;
            display: block;
        }
        .story-content {
            flex: 1;
        }
        .story h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .story .category {
            display: inline-block;
            background: #f0f0f0;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .story .snippet {
            font-size: 1.1rem;
            color: #444;
            line-height: 1.6;
        }
        .story .meta {
            font-size: 0.9em;
            color: #666;
            margin-top: 1rem;
            font-style: italic;
        }
        .loading {
            text-align: center;
            padding: 2rem;
            color: #666;
            font-size: 1.2rem;
        }
        .pagination {
            display: flex;
            justify-content: center;
            margin: 3rem 0;
            gap: 1rem;
            border-top: 1px solid #eee;
            padding-top: 2rem;
        }
        .pagination button {
            background: #fff;
            color: #333;
            border: 1px solid #ccc;
            padding: 0.5rem 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            font-family: Georgia, 'Times New Roman', Times, serif;
        }
        .pagination button:hover:not(:disabled) {
            background: #f5f5f5;
        }
        .pagination button:disabled {
            background: #f5f5f5;
            color: #999;
            cursor: not-allowed;
        }
        .pagination span {
            padding: 0.5rem 1rem;
            color: #666;
        }
        @media (max-width: 450px) {
            .story {
                flex-direction: column;
                gap: 12px;
            }
            .story-image {
                width: 100%;
                margin-right: 0;
                margin-bottom: 12px;
            }
            .story-image img {
                max-height: 200px;
                width: 100%;
                object-fit: cover;
            }
        }
    </style>
</head>
<body>
    ${HEADER_HTML}
    <div class="container">
        <div id="stories"></div>
        <div class="pagination" id="pagination"></div>
    </div>
    ${FOOTER_HTML}

    <script>
        ${SHARED_SCRIPTS}
        const STORIES_PER_PAGE = 20;
        let currentPage = 1;

        function formatDate(daysAgo) {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            return date.toLocaleDateString();
        }

        async function loadStories(page = 1) {
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            const pageSize = 20;
            const offset = (page - 1) * pageSize;

            let url = '/api/stories?limit=' + pageSize + '&offset=' + offset + '&snippet=true';
            if (category) {
                url += '&category=' + encodeURIComponent(category);
            }

            try {
                const response = await fetch(url);
                const data = await response.json();

                const storiesHtml = data.stories.map(story =>
                    '<article class="story">' +
                        (story.image ? '<div class="story-image"><a href="/story/' + story.id + (category ? '?category=' + encodeURIComponent(category) : '') + '"><img src="' + story.image + '?width=120&height=80&fit=cover" alt="' + story.title + '" onerror="handleImageError(this)"></a></div>' : '') +
                        '<div class="story-content">' +
                            '<span class="category">' + story.category + '</span>' +
                            '<h2><a href="/story/' + story.id + (category ? '?category=' + encodeURIComponent(category) : '') + '" style="color: inherit; text-decoration: none;">' + story.title + '</a></h2>' +
                            '<p>' + parseMarkdown(story.content) + '</p>' +
                            '<div class="story-meta">' +
                                '<span class="source">' + story.source + '</span>' +
                                '<span class="date">' + formatDate(story.days_ago) + '</span>' +
                            '</div>' +
                        '</div>' +
                    '</article>'
                ).join('');

                document.getElementById('stories').innerHTML = storiesHtml;

                // Update pagination
                const totalPages = Math.ceil(data.total / pageSize);
                const paginationHtml =
                    '<div class="pagination">' +
                        (page > 1 ? '<button onclick="loadStories(' + (page - 1) + ')">Previous</button>' : '') +
                        '<span>Page ' + page + ' of ' + totalPages + '</span>' +
                        (page < totalPages ? '<button onclick="loadStories(' + (page + 1) + ')">Next</button>' : '') +
                    '</div>';
                document.getElementById('pagination').innerHTML = paginationHtml;

                // Update page title to show category if filtered
                if (category) {
                    document.title = category + ' - SLOP News 24/7';
                    document.querySelector('meta[name="description"]').setAttribute('content',
                        category + ' news and analysis from SLOP News 24/7 - Southern Louisiana Operationalized Partition');
                    document.querySelector('meta[property="og:title"]').setAttribute('content',
                        category + ' - SLOP News 24/7');
                    document.querySelector('meta[property="og:description"]').setAttribute('content',
                        category + ' news and analysis from SLOP News 24/7 - Southern Louisiana Operationalized Partition');
                } else {
                    document.title = 'SLOP News 24/7 - Southern Louisiana Operationalized Partition';
                }

                // Update structured data for category
                if (category) {
                    const categorySchema = {
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": category + " - SLOP News 24/7",
                        "description": category + " news and analysis from SLOP News 24/7 - Southern Louisiana Operationalized Partition",
                        "url": window.location.href,
                        "publisher": {
                            "@type": "Organization",
                            "name": "SLOP News 24/7",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://slop247.com/logo.png"
                            }
                        }
                    };

                    const script = document.createElement('script');
                    script.type = 'application/ld+json';
                    script.text = JSON.stringify(categorySchema);
                    document.head.appendChild(script);
                }
            } catch (error) {
                console.error('Error loading stories:', error);
                document.getElementById('stories').innerHTML = '<p>Error loading stories. Please try again later.</p>';
            }
        }

        // Load stories, render navigation, and update headlines when the page loads
        window.addEventListener('load', () => {
            console.log('Page loaded, initializing...');
            loadStories();
            renderNavigation();
            updateHeadlinesMarquee();
        });
    </script>
</body>
</html>`;
